import { Router } from "express";
import { signup, signin, signout } from "../controller/authController.js";

const authRoute = Router();

authRoute.get("/sign-up", signup);
authRoute.get("/sign-in", signin);
authRoute.get("/sign-out", signout);

export default authRoute;
