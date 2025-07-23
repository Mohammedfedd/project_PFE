import { stripe } from "../index.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import { sendReceiptMail } from "../middlewares/sendReceiptMail.js";
import { sendRefundMail } from "../middlewares/sendRefundMail.js";
import { sendAdminRefundMail } from "../middlewares/adminRefundMail.js";

// Get all courses
export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({ courses });
});

// Get single course by ID
export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  res.json({ course });
});

// Fetch lectures for a course (with subscription check)
export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });
  const user = await User.findById(req.user._id);

  if (user.role === "admin") return res.json({ lectures });

  if (!user.subscription.includes(req.params.id)) {
    return res.status(400).json({ message: "You have not subscribed to this course" });
  }

  res.json({ lectures });
});

// Fetch a single lecture (with subscription check)
export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  const user = await User.findById(req.user._id);

  if (user.role === "admin") return res.json({ lecture });

  if (!user.subscription.includes(lecture.course.toString())) {
    return res.status(400).json({ message: "You have not subscribed to this course" });
  }

  res.json({ lecture });
});

// Get all courses user subscribed to
export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: { $in: req.user.subscription } });
  res.json({ courses });
});

// Create Stripe checkout session for a course purchase
export const checkout = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (!course || !user) {
    return res.status(404).json({ message: "Course or user not found" });
  }

  if (user.subscription.includes(course._id.toString())) {
    return res.status(400).json({ message: "You already have this course" });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "mad",
          product_data: {
            name: course.title,
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user._id.toString(),
      courseId: course._id.toString(),
    },
    success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: "http://localhost:5173/payment-cancel",
  });

  res.status(200).json({ url: session.url });
});

// Verify payment and update user subscription
export const paymentVerification = TryCatch(async (req, res) => {
  const sessionId = req.query.session_id || req.params.id;

  if (!sessionId) {
    return res.status(400).json({ message: "Missing session ID" });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    return res.status(404).json({ message: "Stripe session not found" });
  }

  if (session.payment_status !== "paid") {
    return res.status(400).json({ message: "Payment not completed" });
  }

  const userId = session.metadata.userId;
  const courseId = session.metadata.courseId;

  if (!userId || !courseId) {
    return res.status(400).json({ message: "Invalid payment metadata" });
  }

  const user = await User.findById(userId);
  const course = await Courses.findById(courseId);

  if (!user || !course) {
    return res.status(404).json({ message: "User or course not found" });
  }

  if (!user.subscription.includes(courseId)) {
    user.subscription.push(courseId);

    await Payment.create({
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total,
      currency: session.currency,
      status: session.payment_status,
      user: user._id,
      course: courseId,
    });

    await user.save();

    await sendReceiptMail({
      firstName: user.firstName || "User",
      lastName: user.lastName || "",
      email: user.email,
      course: course,
      amount: session.amount_total,
    });
  }

  res.status(200).json({ message: "Course purchased successfully" });
});

// Refund course and send refund emails
export const refundCourse = TryCatch(async (req, res) => {
  const userId = req.user._id.toString();
  const courseId = req.params.id.toString();

  const user = await User.findById(userId);
  const course = await Courses.findById(courseId);

  if (!user || !course) {
    return res.status(404).json({ message: "User or course not found" });
  }

  if (!user.subscription.includes(courseId)) {
    return res.status(400).json({ message: "You are not subscribed to this course" });
  }

  let payment = await Payment.findOne({ user: userId, course: courseId }).sort({ createdAt: -1 });

  if (!payment) {
    const sessionsList = await stripe.checkout.sessions.list({ limit: 50 });

    const session = sessionsList.data.find(
      (s) =>
        s.metadata?.userId === userId &&
        s.metadata?.courseId === courseId &&
        s.payment_status === "paid"
    );

    if (!session) {
      return res.status(404).json({ message: "No valid Stripe payment session found for refund" });
    }

    payment = await Payment.create({
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total,
      currency: session.currency,
      status: session.payment_status.toLowerCase(),
      user: user._id,
      course: courseId,
    });
  }

  const currentStatus = (payment.status || "").toLowerCase();

  if (currentStatus === "refunded") {
    return res.status(200).json({ message: "Course was already refunded" });
  }

  if (currentStatus !== "paid") {
    return res.status(400).json({ message: "This course is not eligible for refund" });
  }

  await stripe.refunds.create({
    payment_intent: payment.stripe_payment_intent_id,
  });

  user.subscription = user.subscription.filter(id => id.toString() !== courseId);
  await user.save();

  payment.status = "refunded";
  await payment.save();

  await sendRefundMail({
    firstName: user.firstName || "User",
    lastName: user.lastName || "",
    email: user.email,
    course: course,
    amount: payment.amount,
  });

  await sendAdminRefundMail({
    firstName: user.firstName || "User",
    lastName: user.lastName || "",
    email: user.email,
    courseTitle: course.title,
    paymentIntentId: payment.stripe_payment_intent_id,
  });

  res.status(200).json({ message: "Refund processed successfully" });
});
