import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
// @ts-ignore
import TurndownService from "turndown";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { Article } from "../state";
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

turndownService.addRule('img', {
  filter: 'img',
  replacement: (content, node: any) => {
    const src = node.getAttribute('src');
    const alt = node.getAttribute('alt') || '';
    const title = node.getAttribute('title') || '';
    const titlePart = title ? ` "${title}"` : '';
    return src ? `![${alt}](${src}${titlePart})` : '';
  }
});

/**
 * Tải ảnh và upload lên Cloudinary.
 */
const downloadImage = async (img: HTMLImageElement, baseUrl: string): Promise<void> => {
  let originalSrc = img.getAttribute("data-src") || img.getAttribute("data-original") || img.getAttribute("src") || img.getAttribute("srcset");
  if (!originalSrc) return;

  const match = originalSrc.trim().match(/^(\S+)/);
  let parsedSrc = match ? match[1] : originalSrc;
  if (parsedSrc.endsWith(',')) parsedSrc = parsedSrc.slice(0, -1);

  try {
    const absoluteUrl = new URL(parsedSrc, baseUrl).href;
    const response = await fetch(absoluteUrl);
    if (!response.ok) return;

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 500) {
      img.remove();
      return;
    }

    // Upload buffer to Cloudinary
    const cloudinaryResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "github-page" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    img.setAttribute("src", cloudinaryResult.secure_url);
    img.removeAttribute("srcset");
    img.removeAttribute("data-src");
    img.removeAttribute("data-original");
    img.removeAttribute("loading");

    console.log(`[HTML-Helper] Uploaded image to Cloudinary: ${cloudinaryResult.secure_url}`);
  } catch (error) {
    console.error(`[HTML-Helper] Error downloading/uploading image:`, (error as Error).message);
    // Fallback to absolute URL if possible, otherwise remove
    const absoluteUrl = new URL(parsedSrc, baseUrl).href;
    if (absoluteUrl.startsWith("http")) img.setAttribute("src", absoluteUrl);
    else img.remove();
  }
};

/**
 * Fetch HTML với Jina fallback.
 */
export const fetchHtmlContent = async (url: string): Promise<Article | null> => {
  let html = "";
  let usedJina = false;
  try {
    if (url.includes("medium.com")) throw new Error("Force Jina for Medium");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      },
      // @ts-ignore
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (error) {
    console.warn(`[HTML-Helper] Direct fetch failed or bypassed. Using Jina Reader...`);
    const jinaResponse = await fetch(`https://r.jina.ai/${url}`, { headers: { "X-Return-Format": "html" } });
    if (!jinaResponse.ok) throw new Error("Jina fallback failed");
    html = await jinaResponse.text();
    usedJina = true;
  }

  let doc = new JSDOM(html, { url });
  let articleParsed = new Readability(doc.window.document).parse();

  // Nếu không parse được hoặc nội dung quá ngắn (dưới 200 ký tự, thường gặp ở SPA)
  // và chưa sử dụng Jina Reader, tiến hành fallback sang Jina Reader.
  if ((!articleParsed || !articleParsed.textContent || articleParsed.textContent.trim().length < 200) && !usedJina) {
    console.warn(`[HTML-Helper] Content parsed is empty or too short. Retrying via Jina Reader to support client-side rendering (SPA)...`);
    try {
      const jinaResponse = await fetch(`https://r.jina.ai/${url}`, { headers: { "X-Return-Format": "html" } });
      if (jinaResponse.ok) {
        html = await jinaResponse.text();
        doc = new JSDOM(html, { url });
        articleParsed = new Readability(doc.window.document).parse();
      } else {
        console.error(`[HTML-Helper] Jina fallback failed with status: ${jinaResponse.status}`);
      }
    } catch (jinaError) {
      console.error(`[HTML-Helper] Jina fallback failed after empty content:`, (jinaError as Error).message);
    }
  }

  if (!articleParsed) return null;

  const contentDoc = new JSDOM(articleParsed.content || "", { url });
  const images = contentDoc.window.document.querySelectorAll("img");

  if (images.length > 0) {
    await Promise.all(Array.from(images).map(img => downloadImage(img as any, url)));
  }

  let cleanContent = turndownService.turndown(contentDoc.window.document.body);
  cleanContent = cleanContent.replace(/Press enter or click to view image in full size/gi, "").replace(/\n{3,}/g, "\n\n").trim();

  return {
    title: articleParsed.title || "Untitled",
    link: url,
    content: cleanContent,
    pubDate: new Date().toISOString()
  };
};
