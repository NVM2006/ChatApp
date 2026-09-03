/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import express from "express";
import dotenv from "dotenv";
import path from "path";

import authRoute from "./routes/authRoute.js";

const app = express();

const ___dirname = path.resolve();
app.use("/api/auth", authRoute);

dotenv.config();

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(___dirname, "../frontend/dist")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(___dirname, "../frontend", "dist", "index.html"));
  });
}

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
