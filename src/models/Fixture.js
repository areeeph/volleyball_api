import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";
import softDeletePlugin from "./plugins/softDelete.js";
import autopopulate from "mongoose-autopopulate";

const FixtureSchema = new mongoose.Schema(
  {
    sequenceId: {
      type: Number,
      required: true,
      unique: true,
    },
    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    division: {
      type: String,
      required: true,
    },

    team1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      autopopulate: true,
    },
    team2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      autopopulate: true,
    },
  },
  { timestamps: true },
);

FixtureSchema.plugin(softDeletePlugin);
FixtureSchema.plugin(toJSON);
FixtureSchema.plugin(autopopulate);

export default mongoose.model("Fixture", FixtureSchema);
