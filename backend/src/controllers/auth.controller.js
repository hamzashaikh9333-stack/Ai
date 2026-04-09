import userModel from "../models/user.model.js";

import jwt from "jsonwebtoken";

export async function register(req, res) {
  console.log("📥 Register API hit");

  const { username, email, password } = req.body;

  // Check if the user already exists
  try {
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      console.log("❌ User already exists");
      return res.status(400).json({
        message: "Username or email already exists",
        success: false,
        err: "User already exists",
      });
    }

    // Create a new user
    const newUser = await userModel.create({
      username,
      email,
      password,
      verified: true,
    });
    console.log("✅ User created:", newUser.email);

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "register error",
      success: false,
      err: error.message,
    });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
      err: "User not found",
    });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      message: "Password is incorrect",
      success: false,
      err: "Password is incorrect",
    });
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.status(200).json({
    message: "User logged in successfully",
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

export async function getMe(req, res) {
  const userId = req.user._id;
  const user = await userModel.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
      err: "User not found",
    });
  }
  return res.status(200).json({
    message: "User fetched successfully",
    success: true,
    user,
  });
}
