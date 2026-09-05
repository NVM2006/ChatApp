import { Router } from "express";
import { getMessages, sendMessage } from "../controller/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const messageRoute = Router();

messageRoute.use(authMiddleware);

messageRoute.get("/:partnerId", getMessages);
messageRoute.post("/:partnerId", sendMessage);

export default messageRoute;
