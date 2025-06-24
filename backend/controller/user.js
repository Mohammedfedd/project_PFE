import sendMail from '../middlewares/sendMail.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from '../models/User.js';
import TryCatch from '../middlewares/TryCatch.js';
import mongoose from "mongoose";


export const register = TryCatch(async(req,res)=>{
  const { email, firstName, lastName, phone, profilePicture, password } = req.body;

  let existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = {
    firstName,
    lastName,
    phone,
    profilePicture,
    email,
    password: hashPassword,
  };

  const otp = Math.floor(Math.random() * 1000000);

  const activationToken = jwt.sign(
    {
      user,
      otp,
    },
    process.env.Activation_Secret,
    {
      expiresIn: "5m",
    }
  );

  const data = {
    name: firstName,
    otp,
  };

  await sendMail(
    email,
    "ELearning",
    data
  );

  res.status(200).json({
    message: "OTP sent to your email",
    activationToken,
  });
});

export const verifyUser = TryCatch(async(req,res)=>{
  const {otp,activationToken} = req.body;
  const verify = jwt.verify(activationToken,process.env.Activation_Secret);
  if(!verify) return res.status(400).json({
    message:"Verification code Expired",
  });
  if(verify.otp !==otp) return res.status(400).json({
    message:"Wrong verification code",
  });

  await User.create({
    firstName: verify.user.firstName,
    lastName: verify.user.lastName,
    phone: verify.user.phone,
    profilePicture: verify.user.profilePicture,
    email: verify.user.email,
    password: verify.user.password,
  });
  res.json({
    message: "user registered successfully"
  });
});

export const loginUser = TryCatch(async(req,res)=>{
  const {email,password}=req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({
    message:"User not found"
  });
  const matchPassword = await bcrypt.compare(password,user.password);
  if(!matchPassword)
    return res.status(400).json({
      message :"wrong Password"
  });
  const token = await jwt.sign({_id: user._id},process.env.Jwt_Sec,{
    expiresIn :"15d"
  });
  res.json({
    message:`User ${user.firstName} ${user.lastName} logged in`,
    token,
    user,
  });
});

export const myProfile = TryCatch(async(req,res)=>{
  const user = await User.findById(req.user._id);
  res.json({user});
});

export const editUserProfile = TryCatch(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "User not authenticated" });
  if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user ID format" });

  const { currentPassword, newPassword } = req.body;
  const updates = {};

  if (req.file && req.file.path) {
    updates.profilePicture = req.file.path;
  }

  // Fetch user to verify current password
  const user = await User.findById(userId).select("+password");
  if (!user) return res.status(404).json({ message: "User not found" });

  // If user wants to change password
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required to change password" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    updates.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) return res.status(400).json({ message: "No valid fields provided for update" });

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true }).select("-password");

  if (!updatedUser) return res.status(404).json({ message: "User not found" });

  res.json({ message: "Profile updated successfully", user: updatedUser });
});

