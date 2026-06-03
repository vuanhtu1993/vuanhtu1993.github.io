import argparse
import sys
import os
import pymupdf4llm

def extract_pdf(pdf_path, start_page, end_page, image_dir, out_path=None):
    if not os.path.exists(pdf_path):
        print(f"Error: File '{pdf_path}' not found.", file=sys.stderr)
        sys.exit(1)

    # Đảm bảo thư mục lưu ảnh tồn tại
    if image_dir:
        os.makedirs(image_dir, exist_ok=True)

    # Chuyển đổi page (1-based -> 0-based index)
    start_idx = max(0, start_page - 1) if start_page else 0
    # Nếu end_page không được truyền (hoặc rất lớn), ta truyền None để lấy đến hết
    end_idx = (end_page - 1) if end_page is not None else None

    # Tùy chọn chuyển đổi
    try:
        md_text = pymupdf4llm.to_markdown(
            doc=pdf_path,
            pages=list(range(start_idx, end_idx + 1)) if end_idx is not None else None,
            write_images=bool(image_dir),
            image_path=image_dir,
            image_format="png"
        )
        if out_path:
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(md_text)
        else:
            print(md_text)
    except Exception as e:
        print(f"Extraction error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract PDF to Markdown with images using PyMuPDF4LLM.")
    parser.add_argument("--pdf", required=True, help="Path to PDF file")
    parser.add_argument("--start", type=int, default=1, help="Start page (1-based)")
    parser.add_argument("--end", type=int, default=None, help="End page (1-based)")
    parser.add_argument("--img_dir", type=str, default=None, help="Directory to save extracted images")
    parser.add_argument("--out", type=str, default=None, help="Output markdown file path")

    args = parser.parse_args()
    
    extract_pdf(args.pdf, args.start, args.end, args.img_dir, args.out)
