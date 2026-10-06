import path from "path";
import sharp from "sharp";
import multer from "multer";

import asyncHandler from "../middlewares/async.js";
import File from "../models/File.js";
import ErrorResponse from "../utils/errorResponse.js";

const UPLOAD_DIR = path.join(process.cwd(), "public");

export const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, path.join(UPLOAD_DIR, "images"));
    },

    filename(req, file, cb) {
      const parsedPath = path.parse(file.originalname);

      const uploadFileName = `${parsedPath.name}-${Date.now()}${parsedPath.ext}`;

      cb(null, uploadFileName);
    },
  }),

  limits: {
    fieldSize: 25 * 1024 * 1024,
  },
}).single("file");

// @desc    Get files
// @route   GET /api/v1/files
// @access  public
export const getFiles = asyncHandler(async (req, res) => {
  const { page = 0 } = req.query;

  const queryBuilder = () => File.find({}).sort("-createdAt");

  const total = await queryBuilder().countDocuments();

  const data = await queryBuilder()
    .skip(page * 10)
    .limit(10)
    .exec();

  return res.status(200).json({
    success: true,
    data,
    total,
  });
});

// @desc    Upload a file
// @route   POST /api/v1/files
// @access  private
export const uploadFile = asyncHandler(async (req, res) => {
  const parsedPath = path.parse(req.file.filename);
  console.log("parsedPath", parsedPath);
  console.log("UPLOAD_DIR", UPLOAD_DIR);

  const imageSizes = [500, 1000, 1500];
  if (req.file.mimetype.startsWith("image/")) {
    await Promise.all(
      imageSizes.map((size) =>
        sharp(req.file.path)
          .resize(size)
          .webp({
            quality: 90,
            reductionEffort: 6,
          })
          .toFile(
            path.join(
              UPLOAD_DIR,
              "images",
              `${size}`,
              `${parsedPath.name}.webp`,
            ),
          ),
      ),
    );
  }

  const doc = await File.create({
    name: `${parsedPath.name}${parsedPath.ext}`,
    key: parsedPath.name,
  });

  return res.status(201).json({
    success: true,
    data: doc,
  });
});

// @desc    Delete file
// @route   DELETE /api/v1/files/:id
// @access  private
export const deleteFile = asyncHandler(async (req, res, next) => {
  const data = await File.findById(req.params.id);

  if (!data) {
    return next(new ErrorResponse("File not found", 404));
  }

  await data.softDelete();

  return res.status(204).send();
});
