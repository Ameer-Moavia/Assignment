// src/middleware/upload.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const folder = process.env.CLOUDINARY_FOLDER || "wizard_productions/events";
    return {
      folder,
      resource_type: "auto", // auto handles images/videos
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`
    };
  },
});

// add size limit (5 MB max)
const parser = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default parser;
