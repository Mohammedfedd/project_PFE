import { stripe } from "../index.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import { sendReceiptMail } from "../middlewares/sendReceiptMail.js";

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
  // req.user.subscription is an array of course ObjectIds
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
          unit_amount: Math.round(course.price * 100), // price in cents
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
  // Retrieve session_id from query parameter or URL param
  const sessionId = req.query.session_id || req.params.id;

  if (!sessionId) {
    return res.status(400).json({ message: "Missing session ID" });
  }

  // Retrieve the Stripe checkout session
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    return res.status(404).json({ message: "Stripe session not found" });
  }

  if (session.payment_status !== "paid") {
    return res.status(400).json({ message: "Payment not completed" });
  }

  // Extract user and course IDs from metadata
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

  // Add course to user's subscription if not already subscribed
  if (!user.subscription.includes(courseId)) {
    user.subscription.push(courseId);

    // Save payment details to DB
    await Payment.create({
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total,
      currency: session.currency,
      status: session.payment_status,
      user: user._id,
      course: courseId,
    });

    await user.save();

    console.log("📧 Sending receipt email to:", user.email);
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
