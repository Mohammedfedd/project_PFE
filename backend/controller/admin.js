import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Quiz } from "../models/Quiz.js";
import { Payment } from "../models/Payment.js";


const unlinkAsync = promisify(fs.unlink);

export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price, comingSoon } = req.body;
  const image = req.file;

  await Courses.create({
    title,
    description,
    category,
    createdBy,
    image: image?.path,
    duration,
    price,
    comingSoon: comingSoon === "true",
  });

  res.status(201).json({ message: "Course Created Successfully" });
});

export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "No course with this id" });

  const { title, description } = req.body;
  const file = req.file;

  const lecture = await Lecture.create({
    title,
    description,
    video: file?.path,
    course: course._id,
  });

  course.content.push({ type: "lecture", lectureId: lecture._id });
  await course.save();

  res.status(201).json({ message: "Lecture added", lecture });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });

  rm(lecture.video, () => console.log("Video deleted"));
  await lecture.deleteOne();

  await Courses.updateMany({}, { $pull: { content: { lectureId: req.params.id } } });

  res.json({ message: "Lecture deleted" });
});

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      await unlinkAsync(lecture.video);
      console.log("Video deleted");
    })
  );

  rm(course.image, () => console.log("Course image deleted"));

  await Lecture.deleteMany({ course: req.params.id });

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({ message: "Course deleted" });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCourses = await Courses.countDocuments();
  const totalLectures = await Lecture.countDocuments();
  const totalUsers = await User.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();


  const stats = {
    totalCourses,
    totalLectures,
    totalUsers,
    totalQuizzes,
  };

  res.json({ stats });
});

export const getTotalSales = TryCatch(async (req, res) => {
  const result = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, totalSales: { $sum: "$amount" } } },
  ]);

  const totalSales = result.length > 0 ? result[0].totalSales : 0;

  res.json({ totalSales });
});
export const getDailySales = TryCatch(async (req, res) => {
  const dailySales = await Payment.aggregate([
    { $match: { status: "paid" } }, 
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
        totalAmount: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } }, 
  ]);

  res.json({ dailySales }); 
});
export const toggleComingSoon = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  course.comingSoon = !course.comingSoon;
  await course.save();

  res.json({
    message: `Course is now marked as ${course.comingSoon ? "Coming Soon" : "Available"}`,
    comingSoon: course.comingSoon,
  });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");

  res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
  if (req.user.mainrole !== "admin")
    return res.status(403).json({
      message: "This endpoint is assign to superadmin",
    });
  const user = await User.findById(req.params.id);

  if (user.role === "user") {
    user.role = "admin";
    await user.save();

    return res.status(200).json({
      message: "Role updated to admin",
    });
  }

  if (user.role === "admin") {
    user.role = "user";
    await user.save();

    return res.status(200).json({
      message: "Role updated",
    });
  }
});

export const deleteUser = TryCatch(async (req, res) => {
  if (req.user.mainrole !== "admin") {
    return res.status(403).json({ message: "Only admins can delete users" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.deleteOne();

  res.status(200).json({ message: "User deleted successfully" });
});

export const createCategory = TryCatch(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Category name is required" });

  const existing = await Category.findOne({ name: name.toLowerCase().trim() });
  if (existing) return res.status(409).json({ message: "Category already exists" });

  const category = await Category.create({ name: name.toLowerCase().trim() });

  res.status(201).json({ message: "Category created", category });
});

export const getAllCategories = TryCatch(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json({ categories });
});

export const updateCategory = TryCatch(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Category name is required" });

  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  const existing = await Category.findOne({ name: name.toLowerCase().trim(), _id: { $ne: req.params.id } });
  if (existing) return res.status(409).json({ message: "Another category with this name already exists" });

  category.name = name.toLowerCase().trim();
  await category.save();

  res.json({ message: "Category updated", category });
});

export const deleteCategory = TryCatch(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  await category.deleteOne();

  res.json({ message: "Category deleted successfully" });
});
