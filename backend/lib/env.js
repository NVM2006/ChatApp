/* eslint-disable no-undef */
import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT,
  SERVER_URL: process.env.SERVER_URL,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  CLIENT_ULR: process.env.CLIENT_ULR,
};
