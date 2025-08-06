import sendMail,{ sendForgotMail } from '../middlewares/sendMail.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from '../models/User.js';
import { Courses } from '../models/Courses.js';
import TryCatch from '../middlewares/TryCatch.js';
import mongoose from "mongoose";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sendCertificateMail from '../middlewares/sendCertificateMail.js'; 

// Configure file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// REGISTER (EXISTING - UNCHANGED)
export const register = TryCatch(async (req, res) => {
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

// VERIFY USER (EXISTING - UNCHANGED)
export const verifyUser = TryCatch(async (req, res) => {
  const { otp, activationToken } = req.body;
  const verify = jwt.verify(activationToken, process.env.Activation_Secret);

  if (!verify) {
    return res.status(400).json({
      message: "Verification code expired",
    });
  }

  if (verify.otp !== otp) {
    return res.status(400).json({
      message: "Wrong verification code",
    });
  }

  await User.create({
    firstName: verify.user.firstName,
    lastName: verify.user.lastName,
    phone: verify.user.phone,
    profilePicture: verify.user.profilePicture,
    email: verify.user.email,
    password: verify.user.password,
  });

  res.json({
    message: "User registered successfully"
  });
});

// LOGIN USER (EXISTING - UNCHANGED)
export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "User not found"
    });
  }

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    return res.status(400).json({
      message: "Wrong password"
    });
  }

  const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
    expiresIn: "15d"
  });

  res.json({
    message: `User ${user.firstName} ${user.lastName} logged in`,
    token,
    user,
  });
});

// GET PROFILE (EXISTING - UNCHANGED)
export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
});

// EDIT PROFILE (EXISTING - UNCHANGED)
export const editUserProfile = TryCatch(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  const { currentPassword, newPassword, profilePicture } = req.body;
  const updates = {};

  if (profilePicture) {
    updates.profilePicture = profilePicture;
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

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

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields provided for update" });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password");

  res.json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

// GENERATE CERTIFICATE (NEW)
export const generateCertificate = TryCatch(async (req, res) => {
  const { courseId } = req.body;

  console.log("➡️ Generating certificate for courseId:", courseId);

  const user = await User.findById(req.user._id);
  const course = await Courses.findById(courseId);

  if (!user) {
    console.error("❌ User not found");
    return res.status(404).json({ message: "User not found" });
  }

  if (!course) {
    console.error("❌ Course not found");
    return res.status(404).json({ message: "Course not found" });
  }

  console.log("✅ User and course found:", user.firstName, course.title);

  const doc = new PDFDocument({ layout: "landscape", size: "A4" });
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", async () => {
    const pdfData = Buffer.concat(buffers);
    const certId = `CERT-${Date.now()}`;
    const certDir = path.join(__dirname, "..", "public", "certificates");

    console.log("📁 Certificate ID:", certId);

    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
      console.log("📂 Created certificates directory");
    }

    const filePath = path.join(certDir, `${certId}.pdf`);
    fs.writeFileSync(filePath, pdfData);

    console.log("📄 PDF saved to:", filePath);

    const certificateUrl = `/certificates/${certId}.pdf`;

    user.certificates.push({
      courseId,
      certificateUrl,
      title: `Certificate of Completion - ${course.title}`,
      issuedAt: new Date(),
    });

    try {
      await user.save();
      console.log("✅ Certificate saved to user");

      const emailPayload = {
        firstName: user.firstName || "User",
        email: user.email,
        certificateUrl: `http://localhost:5000${certificateUrl}`,
        courseTitle: course.title,
      };

      console.log("📧 Sending certificate email:", emailPayload);

      try {
        await sendCertificateMail(emailPayload);
        console.log("✅ Certificate email sent");
      } catch (mailError) {
        console.error("❌ Error sending certificate email:", mailError);
      }

      res.status(200).json({
        success: true,
        certificateUrl,
      });
    } catch (saveError) {
      console.error("❌ Error saving certificate to user:", saveError);
      res.status(500).json({ success: false, message: "Failed to save certificate." });
    }
  });

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;

  doc.save();

  doc
    .lineWidth(3)
    .strokeColor("#333333")
    .roundedRect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 20)
    .stroke();

  doc
    .fillColor("#e0e0e0")
    .font("Helvetica-Bold")
    .fontSize(100)
    .rotate(-45, { origin: [pageWidth / 2, pageHeight / 2] })
    .opacity(0.1)
    .text("CERTIFICATE", pageWidth / 2 - 250, pageHeight / 2 - 50, {
      align: "center",
      width: 500,
    })
    .rotate(45, { origin: [pageWidth / 2, pageHeight / 2] })
    .opacity(1);

  doc
    .fillColor("#222222")
    .font("Helvetica-Bold")
    .fontSize(38)
    .text("Certificate of Completion", margin, margin + 60, {
      align: "center",
    });

  doc.moveDown(0);

  doc
    .font("Helvetica")
    .fontSize(18)
    .text("This is to certify that", {
      align: "center",
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor("#00539C")
    .text(`${user.firstName} ${user.lastName}`, {
      align: "center",
      underline: true,
      characterSpacing: 1,
    });

  doc.moveDown(0.7);

  doc
    .font("Helvetica")
    .fontSize(18)
    .fillColor("#222222")
    .text("has successfully completed the course", {
      align: "center",
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .fillColor("#00539C")
    .text(`"${course.title}"`, {
      align: "center",
    });

  doc.moveDown(2);

  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#666666")
    .text(`Issued on: ${new Date().toLocaleDateString()}`, {
      align: "center",
    });

  const signatureX = pageWidth - margin - 200;
  const signatureY = pageHeight - margin - 100;

  doc
    .moveTo(signatureX, signatureY)
    .lineTo(signatureX + 180, signatureY)
    .strokeColor("#222222")
    .lineWidth(1.5)
    .stroke();

  doc
    .fontSize(14)
    .fillColor("#222222")
    .text("Authorized Signature", signatureX, signatureY + 10, {
      width: 180,
      align: "center",
    });

  doc.restore();
  doc.end();
});


export const getUserCertificates = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'certificates.courseId',
    select: 'name description'
  });

  res.status(200).json({
    success: true,
    certificates: user.certificates || []
  });
});
export const forgotPassword = TryCatch(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({
      message: "No User with this email",
    });

  const token = jwt.sign({ email }, process.env.Forgot_Secret);

  const data = { email, token };

  await sendForgotMail("E learning", data);

  user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;

  await user.save();

  res.json({
    message: "Reset Password Link is send to you mail",
  });
});

export const resetPassword = TryCatch(async (req, res) => {
  const decodedData = jwt.verify(req.query.token, process.env.Forgot_Secret);

  const user = await User.findOne({ email: decodedData.email });

  if (!user)
    return res.status(404).json({
      message: "No user with this email",
    });

  if (user.resetPasswordExpire === null)
    return res.status(400).json({
      message: "Token Expired",
    });

  if (user.resetPasswordExpire < Date.now()) {
    return res.status(400).json({
      message: "Token Expired",
    });
  }

  const password = await bcrypt.hash(req.body.password, 10);

  user.password = password;

  user.resetPasswordExpire = null;

  await user.save();

  res.json({ message: "Password Reset" });
});