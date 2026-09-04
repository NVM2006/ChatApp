/* eslint-disable no-undef */
import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log("MongoDB connected", conn.connection.host);
  } catch (error) {
    console.error("Error connect to mongodb", error);
    process.exit(1);
  }
};
