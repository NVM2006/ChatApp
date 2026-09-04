import { Router } from "express";
import {
  signup,
  signin,
  signout,
  updateProfile,
} from "../controller/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import arcjetMiddleware from "../middleware/arcjetMiddleware.js";

const authRoute = Router();

authRoute.use(arcjetMiddleware);

authRoute.post("/sign-in", signin);
authRoute.post("/sign-out", signout);
authRoute.post("/sign-up", signup);

authRoute.put("/update-profile", authMiddleware, updateProfile);

export default authRoute;
