

import crypto from "crypto";
import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Save hashed token and expiration in DB
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
  await user.save();

  // Construct reset URL
const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  // Send email
  await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <h3>Reset Your Password</h3>
      <p>Click the link below to reset your password (expires in 10 mins):</p>
      <a href="${resetUrl}">Reset Password</a>
    `,
  });

  res.json({ message: "Password reset email sent" });
};



export const resetPassword = async (req, res) => {
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
};
