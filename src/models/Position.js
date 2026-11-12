import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";
import softDeletePlugin from "./plugins/softDelete.js";
import autopopulate from "mongoose-autopopulate";

const PositionSchema = new mongoose.Schema(
  {
    sequenceId: {
      type: Number,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      autopopulate: true,
    },
  },
  { timestamps: true },
);

PositionSchema.plugin(softDeletePlugin);
PositionSchema.plugin(toJSON);
PositionSchema.plugin(autopopulate);

export default mongoose.model("Position", PositionSchema);
