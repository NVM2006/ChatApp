import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getConversations,
  accessConversation,
} from "../controller/conversationController.js";

const conversationRoute = Router();
conversationRoute.use(authMiddleware);

conversationRoute.get("/", getConversations);

conversationRoute.get("/:partnerId", accessConversation);

export default conversationRoute;
