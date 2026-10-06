import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    // eslint-disable-next-line no-undef
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`mongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;
