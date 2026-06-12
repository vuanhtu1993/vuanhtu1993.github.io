/**
 * cloudinary-utils.ts
 *
 * Tiện ích upload ảnh lên Cloudinary.
 * Đọc cấu hình từ process.env (phải dùng dotenv trước khi gọi).
 */

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Nạp biến môi trường từ .env (nếu project đang chạy từ root)
dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload một hình ảnh từ URL lên Cloudinary.
 *
 * @param imageUrl URL gốc của ảnh (phải là absolute URL)
 * @param domain Domain của docs (để tổ chức folder, ví dụ "docs.example.com")
 * @returns Mảng [boolean, string] - [thành công?, URL mới / lỗi]
 */
export async function uploadImage(imageUrl: string, domain: string): Promise<string> {
  try {
    // Không upload file data (base64) quá lớn hoặc file lỗi
    if (!imageUrl || imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")) {
      return imageUrl; // Giữ nguyên các định dạng data URI / blob
    }

    const folder = `aha-mind/docs-crawler/${domain}`;
    
    // Gọi API upload của Cloudinary
    // Cloudinary hỗ trợ fetch trực tiếp từ remote URL
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return result.secure_url;
  } catch (error) {
    console.error(`❌ Lỗi upload ảnh [${imageUrl}]:`, error instanceof Error ? error.message : String(error));
    // Nếu lỗi, fallback về link cũ để không làm gãy content
    return imageUrl;
  }
}
