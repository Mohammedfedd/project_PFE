import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: false,
    },
    profilePicture: {
      type: String, 
      required: false,
      default: "", 
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    mainrole: {
      type: String,
      default: "user",
    },
    subscription: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses",
      },
    ],
    certificates: [{
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses",
        required: true
      },
      certificateUrl: {
        type: String,
        required: true
      },
      issuedAt: {
        type: Date,
        default: Date.now
      },
      title: {
        type: String,
        required: true
      }
    }],
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", schema);