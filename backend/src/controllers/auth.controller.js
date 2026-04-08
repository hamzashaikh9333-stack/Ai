import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  const { username, email, password } = req.body;

  // Check if the user already exists
  try {
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
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
    });

    const emailVerificationToken = jwt.sign(
      { userId: newUser._id, type: "verify" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // Send a welcome email to the user
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to our app",
        html: `
                  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">Welcome to Perplexity 🎉</h2>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #333;">
        <p style="font-size: 16px;">Hi <strong>${username}</strong>,</p>

        <p style="font-size: 15px; line-height: 1.6;">
          Thank you for registering with us! We're excited to have you on board 🚀
        </p>

        <p style="font-size: 15px; line-height: 1.6;">
          Please verify your email address by clicking the button below:
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/api/auth/verify-email?token=${emailVerificationToken}" 
             style="background: #4f46e5; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
            Verify Email
          </a>
        </div>

        <p style="font-size: 14px; color: #555;">
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 13px; color: #888;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Perplexity. All rights reserved.</p>
      </div>

    </div>
  </div>`,
      });
    } catch (err) {
      console.warn("Failed to send verification email:", err.message);
    }

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

export async function verifyEmail(req, res) {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({
      message: "Token not found",
      success: false,
      err: "Token not found",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "verify") {
      throw new Error("Invalid token type");
    }

    const userId = decoded.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        err: "User not found",
      });
    }

    if (user.verified) {
      return res.send("Email already verified ✅");
    }

    user.verified = true;
    await user.save();
    return res.status(200).send(`
  <div style="margin:0; width:100%; height:100%; padding:0; margin:0; box-sizing:border-box; background:#0b1220; font-family: Arial, sans-serif;">
    
    <div style="max-width:520px; margin:40px auto; padding:20px;">
      
      <div style="
        background:#111827;
        border-radius:14px;
        padding:30px 20px;
        text-align:center;
        border:1px solid #1f2937;
        box-shadow:0 10px 25px rgba(0,0,0,0.6);
      ">
        
        <h2 style="
          color:#16a34a;
          font-size:22px;
          margin-bottom:12px;
        ">
          🎉 Email Verified Successfully
        </h2>
        
        <p style="
          color:#d1d5db;
          font-size:15px;
          line-height:1.6;
        ">
          Hi <strong style="color:#22c55e;">${user.username}</strong>, your email has been successfully verified.
        </p>

        <p style="
          color:#9ca3af;
          font-size:14px;
          margin-top:10px;
          line-height:1.5;
        ">
          You can now login and start using your account.
        </p>

        <!-- Button -->
        <a href="${process.env.CLIENT_URL}/api/auth/login" 
           style="
             display:inline-block;
             margin-top:25px;
             padding:12px 26px;
             background:#14532d;
             color:#dcfce7;
             font-size:14px;
             font-weight:500;
             text-decoration:none;
             border-radius:8px;
             border:1px solid #166534;
           ">
          Go to Login →
        </a>

        <p style="
          margin-top:22px;
          font-size:12px;
          color:#6b7280;
        ">
          If you didn’t request this, you can safely ignore this message.
        </p>

      </div>
    </div>
  </div>
`);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log(error);
      return res.send("Verification link expired ❌");
    }
    return res.status(500).json({
      message: "Error verifying email",
      success: false,
      err: "Error verifying email",
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
  if (!user.verified) {
    return res.status(403).json({
      message: "Email not verified",
      success: false,
      err: "Email not verified",
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
