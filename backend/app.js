import express from "express";
import { ENV } from "./lib/env.js";

import errorMiddleware from "./middleware/errorMiddleware.js";
import path from "path";
import authRoute from "./routes/authRoute.js";
import messageRoute from "./routes/messageRoute.js";
import { connectToDB } from "./lib/db.js";
import conversationRoute from "./routes/conversationRoute.js";

const app = express();

app.use(express.json());

app.use(errorMiddleware);

app.use("/api/auth", authRoute);
app.use("/api/message", messageRoute);
app.use("/api/conversation", conversationRoute);

const ___dirname = path.resolve();
const PORT = ENV.PORT || 5000;

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(___dirname, "../frontend/dist")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(___dirname, "../frontend", "dist", "index.html"));
  });
}

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  connectToDB();
});
