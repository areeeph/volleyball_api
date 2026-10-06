import express from "express";

import {
  create,
  update,
  getAll,
  deleteData,
  get,
} from "../controllers/score.js";

import { protect } from "../middlewares/auth.js";

const router = express.Router();

//router.route("/:id").put(protect, update).get(get).delete(protect, deleteData);

//router.route("/").post(protect, create).get(getAll);

router.route("/:id").put(update).get(get).delete(deleteData);
router.route("/").post(create);
router.route("/").get(getAll);

export default router;
