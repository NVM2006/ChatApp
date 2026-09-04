import { Router } from "express";
import {
  signup,
  signin,
  signout,
  updateProfile,
} from "../controller/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authRoute = Router();

authRoute.post("/sign-in", signin);
authRoute.post("/sign-out", signout);
authRoute.post("/sign-up", signup);

authRoute.post("/update-profile", authMiddleware, updateProfile);

export default authRoute;
