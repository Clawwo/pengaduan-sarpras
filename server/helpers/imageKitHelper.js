import imagekit from "../config/imageKitConfig.js";

export const uploadImage = async (fileBuffer, originalName, folder) => {
  return await imagekit.upload({
    file: fileBuffer,
    fileName: `${Date.now()}_${originalName}`,
    folder,
  });
};

export const deleteImage = async (fileId) => {
  return await imagekit.deleteFile(fileId);
};
