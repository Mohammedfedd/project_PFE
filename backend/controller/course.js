import Stripe from "stripe";
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";


export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({ courses });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  res.json({ course });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });
  const user = await User.findById(req.user._id);

  if (user.role === "admin") return res.json({ lectures });

  if (!user.subscription.includes(req.params.id)) {
    return res.status(400).json({ message: "You have not subscribed to this course" });
  }

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  const user = await User.findById(req.user._id);

  if (user.role === "admin") return res.json({ lecture });

  if (!user.subscription.includes(lecture.course)) {
    return res.status(400).json({ message: "You have not subscribed to this course" });
  }

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: req.user.subscription });
  res.json({ courses });
});

export const checkout = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({ message: "You already have this course" });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(course.price * 100), // cents
    currency: "usd",
    metadata: {
      userId: user._id.toString(),
      courseId: course._id.toString(),
    },
  });

  res.status(201).json({
    clientSecret: paymentIntent.client_secret,
    course,
  });
});

export const paymentVerification = TryCatch(async (req, res) => {
  const { paymentIntentId } = req.body;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === "succeeded") {
    const user = await User.findById(req.user._id);
    const courseId = paymentIntent.metadata.courseId;

    if (!user.subscription.includes(courseId)) {
      user.subscription.push(courseId);

      await Progress.create({
        course: courseId,
        completedLectures: [],
        user: req.user._id,
      });

      await Payment.create({
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        user: user._id,
        course: courseId,
      });

      await user.save();
    }

    return res.status(200).json({ message: "Course Purchased Successfully" });
  } else {
    return res.status(400).json({ message: "Payment Failed" });
  }
});
