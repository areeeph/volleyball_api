import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fsp } from "fs";

import imageSizes from "../config/imageSizes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dest = path.join(__dirname, "..", "public");

const createPublicFolder = async () => {
  if (!fs.existsSync(dest)) {
    await fsp.mkdir(dest);
  }

  const imagesDir = path.join(dest, "images");

  if (!fs.existsSync(imagesDir)) {
    await fsp.mkdir(imagesDir);
  }

  await Promise.all(
    imageSizes.map(async (size) => {
      const resizeDir = path.join(imagesDir, size.toString());

      if (!fs.existsSync(resizeDir)) {
        await fsp.mkdir(resizeDir);
      }
    }),
  );
};

export default createPublicFolder;
