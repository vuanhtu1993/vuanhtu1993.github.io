import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { Article } from "../state";
// @ts-ignore
const pdfParse = require("pdf-parse");
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";

const STANDARD_FONT_DATA_URL = path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts") + "/";

/**
 * Nhận biết URL trỏ đến file PDF.
 */
export const isPdfSource = (url: string): boolean => {
  const lower = url.toLowerCase().split("?")[0].split("#")[0];
  return lower.endsWith(".pdf");
};

/**
 * Kiểm tra canvas có "trắng" không (>98% pixel sáng).
 */
const isCanvasBlank = (data: Uint8ClampedArray, width: number, height: number): boolean => {
  const totalPixels = width * height;
  let lightPixels = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
      lightPixels++;
    }
  }
  return lightPixels / totalPixels > 0.98;
};

/**
 * Render từng trang PDF thành PNG.
 */
const extractPdfImages = async (
  buffer: Buffer,
  outputDir: string,
  sourceUrl: string
): Promise<string[]> => {
  console.log("[PDF-Helper] Starting page rendering...");

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
  });
  const pdf = await loadingTask.promise;

  const imagePaths: string[] = [];
  const SCALE = 2.0;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: SCALE });

      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, viewport.width, viewport.height);

      await page.render({
        canvasContext: context as any,
        viewport,
      }).promise;

      const imageData = context.getImageData(0, 0, viewport.width, viewport.height);
      if (isCanvasBlank(imageData.data, viewport.width, viewport.height)) {
        console.log(`[PDF-Helper] Page ${pageNum}: blank, skipping.`);
        continue;
      }

      const hash = crypto.createHash("md5").update(`${sourceUrl}-page-${pageNum}`).digest("hex").slice(0, 8);
      const fileName = `pdf-${hash}-p${pageNum}.png`;
      const filePath = path.join(outputDir, fileName);

      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
      imagePaths.push(`./assets/${fileName}`);

      console.log(`[PDF-Helper] Rendered page ${pageNum} → ${fileName}`);
    } catch (pageError) {
      console.error(`[PDF-Helper] Error rendering page ${pageNum}:`, (pageError as Error).message);
    }
  }

  return imagePaths;
};

/**
 * Trích xuất title từ PDF metadata.
 */
const extractPdfTitle = (info: Record<string, any>, url: string): string => {
  if (info?.Title && typeof info.Title === "string" && info.Title.trim().length > 0) {
    return info.Title.trim();
  }
  const filename = url.split("/").pop() || "document";
  return decodeURIComponent(filename.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
};

/**
 * Main PDF fetcher: download + extract text + render images.
 */
export const fetchPdfContent = async (url: string): Promise<Article | null> => {
  console.log(`[PDF-Helper] Downloading: ${url}`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/pdf,*/*;q=0.8"
    }
  });

  if (!response.ok) throw new Error(`HTTP ${response.status} when fetching PDF`);

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("pdf") && !url.toLowerCase().endsWith(".pdf")) {
    console.warn("[PDF-Helper] Server không trả về Content-Type PDF.");
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const outputDir = path.join(process.cwd(), "blog", "aha-mind", "assets");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const [textData, imagePaths] = await Promise.all([
    pdfParse(buffer),
    extractPdfImages(buffer, outputDir, url),
  ]);

  const sanitizedText = textData.text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");

  const imageSection = imagePaths.length > 0
    ? "\n\n---\n\n## 📸 Hình ảnh từ tài liệu\n\n" + imagePaths.map((p, i) => `![Trang ${i + 1}](${p})`).join("\n\n")
    : "";

  return {
    title: extractPdfTitle(textData.info, url),
    link: url,
    content: sanitizedText.trim() + imageSection,
    pubDate: new Date().toISOString(),
  };
};
