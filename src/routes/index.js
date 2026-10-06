import express from "express";

import scoreRoutes from "./score.js";
import teamRoutes from "./team.js";
import fileRoutes from "./file.js";

const router = express.Router();

router.use("/teams", teamRoutes);
router.use("/scores", scoreRoutes);
router.use("/files", fileRoutes);

export default router;
