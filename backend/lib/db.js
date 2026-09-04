/* eslint-disable no-undef */
import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected", conn.connection.host);
  } catch (error) {
    console.error("Error connect to mongodb", error);
    process.exit(1);
  }
};
