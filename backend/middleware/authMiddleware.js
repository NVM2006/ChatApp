import User from "../model/userModel.js";
import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const authorCode = req.headers.authorization;
    if (authorCode && authorCode.startsWith("Bearer")) {
      token = authorCode.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
