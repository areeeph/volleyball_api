import express from "express";

import {
  getFiles,
  upload,
  uploadFile,
  deleteFile,
} from "../controllers/file.js";

import { protect } from "../middlewares/auth.js";

const router = express.Router();

//router.route('/').get(protect, getFiles).post(protect, upload, uploadFile);

//router.route('/:id').delete(protect, deleteFile);

router.route("/").get(getFiles).post(upload, uploadFile);

router.route("/:id").delete(deleteFile);

export default router;
