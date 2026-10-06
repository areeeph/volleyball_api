import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";
import softDeletePlugin from "./plugins/softDelete.js";

import autopopulate from "mongoose-autopopulate";

const UserSchema = new mongoose.Schema(
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
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

UserSchema.plugin(softDeletePlugin);
UserSchema.plugin(toJSON);
UserSchema.plugin(autopopulate);

export default mongoose.model("User", UserSchema);
