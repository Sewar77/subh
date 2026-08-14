import multer from "multer";
import crypto from "node:crypto";
import fs from "fs";
import os from "node:os";
import path from "node:path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(os.tmpdir(), "subh-uploads");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const extensions = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };
    cb(null, `${crypto.randomUUID()}${extensions[file.mimetype] || ""}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error("Unsupported file type");
    error.status = 415;
    error.publicMessage = "Only JPEG, PNG, and WebP images are supported";
    cb(error, false);
  }
};
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});
export default upload;

const matchesSignature = (buffer, mimetype) => {
  if (mimetype === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimetype === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  }
  if (mimetype === "image/webp") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }
  return false;
};

export const verifyUploadedImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const handle = await fs.promises.open(req.file.path, "r");
    const signature = Buffer.alloc(12);
    await handle.read(signature, 0, signature.length, 0);
    await handle.close();

    if (!matchesSignature(signature, req.file.mimetype)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      req.file = undefined;
      const error = new Error("Uploaded file signature is invalid");
      error.status = 415;
      error.publicMessage = "Unsupported image content";
      return next(error);
    }
    return next();
  } catch (error) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    return next(error);
  }
};
