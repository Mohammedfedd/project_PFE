// models/Educator.js

import mongoose from "mongoose";

const educatorSchema = new mongoose.Schema(
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
    bio: {
      type: String,
      required: false,
      default: "",
    },
    socials: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Educator = mongoose.model("Educator", educatorSchema);
