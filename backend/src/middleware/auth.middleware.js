import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export async function authUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
      err: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists in DB
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
        err: "Invalid user",
      });
    }

    req.user = user; 
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
      err: "Invalid token",
    });
  }
}