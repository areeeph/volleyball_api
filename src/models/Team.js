import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";
import softDeletePlugin from "./plugins/softDelete.js";
import autopopulate from "mongoose-autopopulate";

const TeamSchema = new mongoose.Schema(
  {
    sequenceId: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    short_name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

TeamSchema.plugin(softDeletePlugin);
TeamSchema.plugin(toJSON);
TeamSchema.plugin(autopopulate);

export default mongoose.model("Team", TeamSchema);
