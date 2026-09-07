import { Router } from "express";
import {
  signup,
  signin,
  signout,
  updateProfile,
  checkAuth,
} from "../controller/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import arcjetMiddleware from "../middleware/arcjetMiddleware.js";

const authRoute = Router();

authRoute.use(arcjetMiddleware);

authRoute.post("/signin", signin);
authRoute.post("/signout", signout);
authRoute.post("/signup", signup);
authRoute.get("/check", checkAuth);

authRoute.put("/update-profile", authMiddleware, updateProfile);

export default authRoute;
