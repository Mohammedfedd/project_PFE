import 'dotenv/config'; // Load .env
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from 'uuid';
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },
  filename(req, file, cb) {
    const id = uuid();
    const ext = path.extname(file.originalname); // safer than split
    cb(null, `${id}${ext}`);
  },
});

// Filter: only allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "video/mp4", "video/quicktime", "video/x-matroska"
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Upload middleware
export const uploadFiles = (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return next();

    const isVideo = req.file.mimetype.startsWith("video");

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: isVideo ? "video" : "image",
      });

      req.file.cloudinaryUrl = result.secure_url;
      //fs.unlinkSync(req.file.path); // Clean up local file
      next();
    } catch (error) {
      next(error);
    }
  });
};
