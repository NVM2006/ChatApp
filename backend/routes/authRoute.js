import { Router } from "express";
import { signup, signin, signout } from "../controller/authController.js";

const authRoute = Router();

authRoute.post("/sign-in", signin);
authRoute.post("/sign-out", signout);
authRoute.post("/sign-up", signup);

export default authRoute;
