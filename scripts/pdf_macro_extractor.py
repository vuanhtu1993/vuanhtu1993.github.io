#!/usr/bin/env python3
"""
PDF Macro Extractor Sub-Agent
==============================
Sub-agent chuyên biệt extract dữ liệu vĩ mô từ các báo cáo chiến lược
của CTCK (SSI, MBS, TCBS) cho workflow /create-macro-report.

Cách dùng:
    python3 scripts/pdf_macro_extractor.py --month 2026-02

Output:
    docs/vietnam-macro-economic-monthly/data/YYYY-MM/extracted_YYYY-MM.json
    docs/vietnam-macro-economic-monthly/data/YYYY-MM/extracted_YYYY-MM.md
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime

try:
    import pdfplumber
except ImportError:
    print("❌ Thiếu thư viện pdfplumber. Cài bằng: pip3 install pdfplumber")
    sys.exit(1)

# ─── CẤU HÌNH ────────────────────────────────────────────────────────────────

BASE_DIR = os.path.join(
    os.path.dirname(__file__),
    "..", "docs", "vietnam-macro-economic-monthly", "data"
)

# Từ khóa nhận biết trang có dữ liệu vĩ mô
MACRO_KEYWORDS = [
    "KINH TẾ VIỆT NAM", "Bức tranh vĩ mô", "kinh tế vĩ mô",
    "CPI", "IIP", "PMI", "FDI",
    "Xuất khẩu", "Nhập khẩu", "kim ngạch", "Thặng dư", "cán cân thương mại",
    "Tỷ giá", "Lãi suất", "NHNN", "OMO",
    "Tổng mức bán lẻ", "Tín dụng", "sản xuất công nghiệp"
]

# Trang vĩ mô thường nằm trong khoảng này
MACRO_PAGE_RANGE = (2, 10)

# Mapping indicators: regex pattern → (tên chuẩn, đơn vị)
INDICATOR_PATTERNS = {
    "PMI": (
        r"PMI[^\d]*(\d+[,.]?\d*)",
        "PMI Manufacturing", "điểm"
    ),
    "IIP": (
        r"(?:IIP|sản xuất công nghiệp)[^\d%]*([+-]?\d+[,.]?\d*)\s*%",
        "IIP", "%YoY"
    ),
    "CPI_YoY": (
        r"CPI[^\d%]*([+-]?\d+[,.]?\d*)\s*%(?:[^\n]*(?:so với cùng kỳ|svck|YoY))?",
        "CPI", "%YoY"
    ),
    "CPI_MoM": (
        r"CPI[^\d%]*([+-]?\d+[,.]?\d*)\s*%[^\n]*(?:so với tháng|MoM|tháng trước)",
        "CPI", "%MoM"
    ),
    "Export": (
        r"(?:xuất khẩu|kim ngạch xuất)[^\d]*(\d+[,.]?\d*)\s*(?:tỷ USD|USD bn|billion)",
        "Xuất khẩu", "tỷ USD"
    ),
    "Import": (
        r"(?:nhập khẩu|kim ngạch nhập)[^\d]*(\d+[,.]?\d*)\s*(?:tỷ USD|USD bn|billion)",
        "Nhập khẩu", "tỷ USD"
    ),
    "Trade_Balance": (
        r"(?:thặng dư|cán cân thương mại)[^\d]*([+-]?\d+[,.]?\d*)\s*(?:tỷ USD|USD bn)",
        "Cán cân TM", "tỷ USD"
    ),
    "FDI_Disbursed": (
        r"FDI[^\n]*(?:giải ngân|thực hiện)[^\d]*(\d+[,.]?\d*)\s*(?:tỷ USD|USD bn)",
        "FDI giải ngân", "tỷ USD YTD"
    ),
    "Credit_Growth": (
        r"(?:tín dụng|tăng trưởng tín dụng)[^\d%]*([+-]?\d+[,.]?\d*)\s*%",
        "Tăng trưởng tín dụng", "%YTD"
    ),
    "Exchange_Rate": (
        r"(?:tỷ giá|USD/VND|USDVND)[^\d]*(\d{4,6})",
        "Tỷ giá USD/VND", "VND"
    ),
    "Retail_Sales": (
        r"(?:bán lẻ|tổng mức bán lẻ)[^\d%]*([+-]?\d+[,.]?\d*)\s*%",
        "Tổng mức bán lẻ", "%YoY"
    ),
}


# ─── MODULE 1: SCAN FOLDER ───────────────────────────────────────────────────

def scan_folder(month: str) -> list[str]:
    """Tìm tất cả PDF trong folder data/YYYY-MM/."""
    folder = os.path.normpath(os.path.join(BASE_DIR, month))
    if not os.path.isdir(folder):
        print(f"⚠️  Folder không tồn tại: {folder}")
        return []
    pdfs = [
        os.path.join(folder, f)
        for f in sorted(os.listdir(folder))
        if f.lower().endswith(".pdf")
    ]
    print(f"📂 Folder: {folder}")
    print(f"📄 Tìm thấy {len(pdfs)} PDF: {[os.path.basename(p) for p in pdfs]}")
    return pdfs


# ─── MODULE 2: DETECT SOURCE ─────────────────────────────────────────────────

def detect_source(filename: str) -> str:
    """Nhận biết CTCK từ tên file."""
    fname = filename.upper()
    if "SSI" in fname:
        return "SSI Research"
    if "MBS" in fname:
        return "MBS Research"
    if "TCBS" in fname:
        return "TCBS Research"
    if "VIETOUTLOOK" in fname or ("VIETNAM" in fname and "OUTLOOK" in fname):
        return "TCBS Research"
    return "Không xác định"


# ─── MODULE 3: EXTRACT PAGES ─────────────────────────────────────────────────

def extract_macro_pages(pdf_path: str) -> list[dict]:
    """Extract text và bảng từ các trang có dữ liệu vĩ mô."""
    results = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            total = len(pdf.pages)
            end = min(MACRO_PAGE_RANGE[1], total)
            for i in range(MACRO_PAGE_RANGE[0] - 1, end):
                page = pdf.pages[i]
                text = page.extract_text() or ""
                tables = page.extract_tables() or []
                # Chỉ giữ trang có keyword vĩ mô
                if any(kw.lower() in text.lower() for kw in MACRO_KEYWORDS):
                    results.append({
                        "page": i + 1,
                        "text": text,
                        "tables": tables
                    })
    except Exception as e:
        print(f"  ❌ Lỗi đọc PDF {os.path.basename(pdf_path)}: {e}")
    return results


# ─── MODULE 4: PARSE INDICATORS ──────────────────────────────────────────────

def parse_indicators(pages: list[dict]) -> dict:
    """
    Parse text và bảng từ các trang → dict chuẩn hóa các chỉ số vĩ mô.
    Trade-off: regex-based nên có thể miss hoặc nhầm số; cần fact-check thủ công.
    """
    # Khoảng giá trị hợp lệ để lọc noise (năm, số trang, v.v.)
    VALID_RANGES = {
        "PMI":           (40.0, 65.0),    # PMI hợp lệ: 40-65 điểm
        "IIP":           (-30.0, 50.0),   # IIP %YoY: -30% đến +50%
        "CPI_YoY":       (-5.0, 20.0),    # CPI YoY: -5% đến +20%
        "CPI_MoM":       (-3.0, 5.0),     # CPI MoM: -3% đến +5%
        "Export":        (1.0, 100.0),    # XK: 1-100 tỷ USD/tháng
        "Import":        (1.0, 100.0),    # NK: 1-100 tỷ USD/tháng
        "Trade_Balance": (-20.0, 20.0),   # CCTM: ±20 tỷ USD
        "FDI_Disbursed": (0.1, 50.0),    # FDI giải ngân: 0.1-50 tỷ USD
        "Credit_Growth": (-5.0, 30.0),   # Tín dụng: -5% đến +30%
        "Exchange_Rate": (20000, 27000),  # USD/VND: 20k-27k
        "Retail_Sales":  (-20.0, 40.0),  # Bán lẻ: -20% đến +40%
    }

    full_text = "\n".join(p["text"] for p in pages)
    indicators = {}

    for key, (pattern, label, unit) in INDICATOR_PATTERNS.items():
        matches = re.findall(pattern, full_text, re.IGNORECASE)
        if matches:
            lo, hi = VALID_RANGES.get(key, (-1e9, 1e9))
            for raw_match in matches:
                raw = raw_match.replace(",", ".")
                try:
                    value = float(raw)
                    # Lọc giá trị ngoài khoảng hợp lệ (năm, số trang, v.v.)
                    if lo <= value <= hi:
                        indicators[key] = {
                            "label": label,
                            "value": value,
                            "unit": unit,
                            "confidence": "medium",
                            "raw_match": raw_match
                        }
                        break  # Lấy match đầu tiên hợp lệ
                except ValueError:
                    pass

    # Tìm thêm từ bảng (table-based - độ tin cậy cao hơn)
    for page_data in pages:
        for table in page_data.get("tables", []):
            _parse_table(table, indicators, page_data["page"])

    return indicators



def _parse_table(table: list, indicators: dict, page_num: int):
    """Extract data từ bảng PDF — độ chính xác cao hơn regex."""
    if not table:
        return

    TABLE_MAPPINGS = {
        "PMI": [["PMI", "nhà quản trị mua hàng"], (40.0, 65.0)],
        "IIP": [["IIP", "sản xuất công nghiệp", "công nghiệp"], (-30.0, 50.0)],
        "CPI_YoY": [["CPI", "chỉ số giá tiêu dùng", "lạm phát"], (-5.0, 20.0)],
        "Export": [["xuất khẩu", "kim ngạch xuất"], (1.0, 100.0)],
        "Import": [["nhập khẩu", "kim ngạch nhập"], (1.0, 100.0)],
        "Trade_Balance": [["cán cân", "thặng dư", "thâm hụt"], (-20.0, 20.0)],
        "FDI_Disbursed": [["FDI", "giải ngân", "đầu tư nước ngoài"], (0.1, 50.0)],
        "Credit_Growth": [["tín dụng", "tăng trưởng tín dụng"], (-5.0, 30.0)],
        "Retail_Sales": [["bán lẻ", "tổng mức bán lẻ"], (-20.0, 40.0)],
    }

    for row in table:
        if not row:
            continue
        row_text = " ".join(str(cell or "") for cell in row).lower()

        for key, (keywords, (lo, hi)) in TABLE_MAPPINGS.items():
            if any(kw in row_text for kw in keywords):
                nums = re.findall(r"[+-]?\d+[,.]?\d*", row_text)
                for num_str in nums:
                    raw = num_str.replace(",", ".")
                    try:
                        value = float(raw)
                        if lo <= value <= hi:  # Range validation
                            if key not in indicators or indicators[key]["confidence"] == "medium":
                                _, label, unit = INDICATOR_PATTERNS[key]
                                indicators[key] = {
                                    "label": label,
                                    "value": value,
                                    "unit": unit,
                                    "confidence": "high",
                                    "source": f"table_page_{page_num}"
                                }
                            break  # Lấy số hợp lệ đầu tiên
                    except ValueError:
                        pass


# ─── MODULE 5: MERGE SOURCES ─────────────────────────────────────────────────

def merge_sources(sources: list[dict]) -> dict:
    """
    Gộp dữ liệu từ nhiều nguồn CTCK.
    Đánh dấu conflict nếu cùng chỉ số có giá trị khác nhau > 5%.
    """
    merged = {}
    for source in sources:
        for key, data in source.get("indicators", {}).items():
            if key not in merged:
                merged[key] = {
                    "label": data["label"],
                    "unit": data["unit"],
                    "values": {source["source"]: data["value"]},
                    "conflict": False,
                    "final_value": data["value"],
                    "final_source": source["source"]
                }
            else:
                existing_val = merged[key]["final_value"]
                new_val = data["value"]
                merged[key]["values"][source["source"]] = new_val
                # Conflict nếu lệch >5% hoặc >0.5 điểm (cho PMI)
                threshold = 0.5 if key == "PMI" else abs(existing_val * 0.05)
                if abs(existing_val - new_val) > max(threshold, 0.1):
                    merged[key]["conflict"] = True
                    # Ưu tiên giữ giá trị đầu tiên (SSI thường là nguồn chính)
    return merged


# ─── MODULE 6: RENDER OUTPUT ─────────────────────────────────────────────────

def render_json(data: dict, output_path: str):
    """Xuất dataset ra file JSON."""
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ JSON: {output_path}")


def render_markdown(data: dict, output_path: str):
    """Xuất Bảng Macro Dashboard ra file Markdown."""
    month = data["month"]
    sources_str = ", ".join(s["source"] for s in data["sources"] if s["indicators"])

    lines = [
        f"# Dữ liệu vĩ mô tháng {month}",
        f"> **Nguồn:** {sources_str}  ",
        f"> **Trích xuất lúc:** {data['generated_at']}  ",
        f"> ⚠️ *Dữ liệu được extract tự động bằng regex/pdfplumber — cần fact-check trước khi dùng.*",
        "",
        "## Bảng Macro Dashboard",
        "",
        "| Chỉ số | Giá trị | Đơn vị | Độ tin cậy | Nguồn | Ghi chú |",
        "|:-------|:-------:|:------:|:----------:|:------|:--------|",
    ]

    # Thứ tự ưu tiên hiển thị
    display_order = [
        "PMI", "IIP", "Retail_Sales", "Export", "Import",
        "Trade_Balance", "FDI_Disbursed", "CPI_YoY", "CPI_MoM",
        "Credit_Growth", "Exchange_Rate"
    ]

    merged = data.get("merged", {})
    for key in display_order:
        if key not in merged:
            continue
        item = merged[key]
        conflict_note = "⚠️ Conflict: " + str(item["values"]) if item["conflict"] else ""
        sources_list = " / ".join(item["values"].keys())
        lines.append(
            f"| **{item['label']}** | {item['final_value']} | {item['unit']} "
            f"| {'✅' if not item['conflict'] else '⚠️'} | {sources_list} | {conflict_note} |"
        )

    lines += [
        "",
        "---",
        "> *Made by Anh Tu - Share to be share*"
    ]

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  ✅ Markdown: {output_path}")


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="PDF Macro Extractor Sub-Agent",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ví dụ:
  python3 scripts/pdf_macro_extractor.py --month 2026-02
  python3 scripts/pdf_macro_extractor.py --month 2026-01 --verbose
        """
    )
    parser.add_argument("--month", required=True, help="Tháng cần xử lý, format: YYYY-MM")
    parser.add_argument("--verbose", action="store_true", help="In chi tiết text từng trang")
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  PDF Macro Extractor Sub-Agent")
    print(f"  Tháng: {args.month}")
    print(f"{'='*60}\n")

    # Bước 1: Scan folder
    pdf_files = scan_folder(args.month)
    if not pdf_files:
        print(f"⚠️  Không tìm thấy PDF trong data/{args.month}/. Thoát.")
        sys.exit(0)

    # Bước 2-4: Extract từng PDF
    sources = []
    for pdf_path in pdf_files:
        fname = os.path.basename(pdf_path)
        source_name = detect_source(fname)
        print(f"\n📊 Đang xử lý: {fname} [{source_name}]")

        pages = extract_macro_pages(pdf_path)
        print(f"   → Tìm thấy {len(pages)} trang vĩ mô: {[p['page'] for p in pages]}")

        indicators = parse_indicators(pages)
        print(f"   → Extract được {len(indicators)} chỉ số: {list(indicators.keys())}")

        if args.verbose:
            for pg in pages:
                print(f"\n   [Trang {pg['page']}]\n{pg['text'][:600]}")

        sources.append({
            "file": fname,
            "source": source_name,
            "page_count": len(pages),
            "indicators": indicators
        })

    # Bước 5: Merge
    merged = merge_sources(sources)
    conflicts = [k for k, v in merged.items() if v["conflict"]]
    if conflicts:
        print(f"\n⚠️  Phát hiện conflict ở: {conflicts} — cần fact-check thủ công!")
    else:
        print(f"\n✅ Không có conflict giữa các nguồn.")

    # Bước 6: Render output
    output_data = {
        "month": args.month,
        "generated_at": datetime.now().isoformat(),
        "sources": sources,
        "merged": merged,
        "conflicts": conflicts
    }

    folder = os.path.normpath(os.path.join(BASE_DIR, args.month))
    json_path = os.path.join(folder, f"extracted_{args.month}.json")
    md_path = os.path.join(folder, f"extracted_{args.month}.txt")  # .txt để Docusaurus không compile


    print(f"\n📝 Xuất output...")
    render_json(output_data, json_path)
    render_markdown(output_data, md_path)

    print(f"\n{'='*60}")
    print(f"  ✅ Hoàn tất! {len(merged)} chỉ số từ {len(sources)} nguồn.")
    print(f"  📂 Xem kết quả tại: data/{args.month}/extracted_{args.month}.md")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
