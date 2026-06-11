import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image to Cloudinary.
 * @param filePath The local absolute path to the image file.
 * @param folder The folder name in Cloudinary where the image should be stored.
 * @returns The secure URL of the uploaded image.
 */
export const uploadImageToCloudinary = async (filePath: string, folder: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });
    return result.secure_url;
  } catch (error: any) {
    console.error(`[Cloudinary] ❌ Lỗi upload ảnh ${filePath}:`, error.message);
    throw error;
  }
};
