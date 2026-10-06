import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";
import softDeletePlugin from "./plugins/softDelete.js";

const FileSchema = new mongoose.Schema(
  {
    name: String,
    key: String,
  },
  { timestamps: true },
);

FileSchema.plugin(softDeletePlugin);
FileSchema.plugin(toJSON);

export default mongoose.model("File", FileSchema);
