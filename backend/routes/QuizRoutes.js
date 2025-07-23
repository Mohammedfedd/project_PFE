import express from 'express';
import { isAdmin, isAuth } from '../middlewares/isAuth.js';
import {
  addQuiz,
  deleteQuiz,
  getQuizzesByCourse,
  submitQuizAnswers,
  getQuizById,
} from '../controller/QuizController.js';

const router = express.Router();

router.post('/admin/quiz/new', isAuth,isAdmin,addQuiz);
router.delete('/admin/quiz/:id', isAuth,isAdmin,deleteQuiz);
router.get('/user/quiz/:courseId', isAuth,getQuizzesByCourse);
router.post('/user/quiz/submit', isAuth,submitQuizAnswers);
router.get('/quiz/:id', isAuth,getQuizById); // For viewing a specific quiz


export default router;
