
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImageToImageKit, deleteImageFromImageKit } from "../services/image.service.js";


export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(413).json({ message: "File size exceeds 5MB limit" });
  }

  const uniqueFileName = `memory_${Date.now()}_${req.file.originalname}`;
  
 
  const imageData = await uploadImageToImageKit(req.file.buffer, uniqueFileName);

  return res.status(201).json({
    message: "Image uploaded successfully",
    data: imageData,
  });
});


export const deleteImage = asyncHandler(async (req, res) => {
  const { assetId } = req.params;

  await deleteImageFromImageKit(assetId);

  return res.status(200).json({
    message: "Image deleted successfully from cloud",
  });
});