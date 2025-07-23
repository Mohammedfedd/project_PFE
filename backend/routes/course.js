import express from 'express';
import {
  checkout,
  fetchLecture,
  fetchLectures,
  getAllCourses,
  getMyCourses,
  getSingleCourse,
  paymentVerification,
  refundCourse ,
} from '../controller/course.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);
router.get("/lectures/:id", isAuth, fetchLectures);
router.get("/lecture/:id", isAuth, fetchLecture);
router.get("/mycourse", isAuth, getMyCourses);
router.post("/course/checkout/:id", isAuth, checkout);
router.post("/verification/:id", isAuth, paymentVerification);

// Add refund route here
router.post("/course/refund/:id", isAuth, refundCourse);

export default router;
