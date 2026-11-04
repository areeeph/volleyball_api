import express from "express";

import scoreRoutes from "./score.js";
import teamRoutes from "./team.js";
import fileRoutes from "./file.js";
import fixtureRoutes from "./fixture.js";

const router = express.Router();

router.use("/teams", teamRoutes);
router.use("/scores", scoreRoutes);
router.use("/files", fileRoutes);
router.use("/fixtures", fixtureRoutes);

export default router;
