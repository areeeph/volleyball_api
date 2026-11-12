import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";
import softDeletePlugin from "./plugins/softDelete.js";
import autopopulate from "mongoose-autopopulate";

const TopSixSchema = new mongoose.Schema(
  {
    sequenceId: {
      type: Number,
      required: true,
      unique: true,
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

TopSixSchema.plugin(softDeletePlugin);
TopSixSchema.plugin(toJSON);
TopSixSchema.plugin(autopopulate);

export default mongoose.model("TopSix", TopSixSchema);
