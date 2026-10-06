import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";
import softDeletePlugin from "./plugins/softDelete.js";
import autopopulate from "mongoose-autopopulate";

const ScoreSchema = new mongoose.Schema(
  {
    sequenceId: {
      type: Number,
      required: true,
      unique: true,
    },
    current_set: {
      type: Number,
      required: true,
      default: 1,
    },
    sets: [
      {
        set_number: {
          type: Number,
          required: true,
        },
        team1_score: {
          type: Number,
          required: true,
          default: 0,
        },
        team2_score: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
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

ScoreSchema.plugin(softDeletePlugin);
ScoreSchema.plugin(toJSON);
ScoreSchema.plugin(autopopulate);

export default mongoose.model("Score", ScoreSchema);
