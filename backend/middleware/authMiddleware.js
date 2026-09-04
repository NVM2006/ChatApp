import User from "../model/userModel";
import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const authorCode = req.header.authorization;
    if (authorCode && authorCode.startWith("Bearer")) {
      token = authorCode.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, ENV.SECRET);
    const user = await User.findById(decoded.userId);

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
