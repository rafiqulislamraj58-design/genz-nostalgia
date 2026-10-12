
import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Buffer 
export const uploadImageToImageKit = async (fileBuffer, fileName) => {
  try {
    const response = await imagekit.upload({
      file: fileBuffer, 
      fileName: fileName,
      folder: "/zen-z-nostalgia/memories", 
    });

    return {
      url: response.url,
      assetId: response.fileId, 
      altText: fileName,
    };
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw new Error("Failed to upload image to cloud");
  }
};

// ImageKit 
export const deleteImageFromImageKit = async (assetId) => {
  try {
    await imagekit.deleteFile(assetId);
    return true;
  } catch (error) {
    console.error("ImageKit delete error:", error);
    throw new Error("Failed to delete image from cloud");
  }
};