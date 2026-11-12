import express from "express";

import scoreRoutes from "./score.js";
import teamRoutes from "./team.js";
import fileRoutes from "./file.js";
import fixtureRoutes from "./fixture.js";
import positionRoutes from "./position.js";
import topsixRoutes from "./topsix.js";

const router = express.Router();

router.use("/teams", teamRoutes);
router.use("/scores", scoreRoutes);
router.use("/files", fileRoutes);
router.use("/fixtures", fixtureRoutes);
router.use("/positions", positionRoutes);
router.use("/topsix", topsixRoutes);

export default router;
