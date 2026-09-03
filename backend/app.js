import express from "express";
import dotenv from "dotenv";

import authRoute from "./routes/authRoute.js";

const app = express();

app.use("/api/auth", authRoute);

dotenv.config();
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;
// eslint-disable-next-line no-unused-vars
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
