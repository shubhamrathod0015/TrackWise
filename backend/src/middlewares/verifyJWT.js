// src/middlewares/verifyJWT.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new ApiError(401, "Authentication token is missing"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // Attach decoded payload to request
    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};
