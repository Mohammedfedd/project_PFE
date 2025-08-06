import express from 'express';
import { isAdmin, isAuth } from '../middlewares/isAuth.js';
import {
  addLectures,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllStats,
  toggleComingSoon,
  getAllUser,
  updateRole,
  deleteUser,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getTotalSales,
  getDailySales,
  createEducator,
  getAllEducators,
  updateEducator,
  deleteEducator,
} from '../controller/admin.js';
import { addQuiz, deleteQuiz } from '../controller/QuizController.js';
import { uploadFiles } from '../middlewares/multer.js';
import { deleteProgress } from '../controller/admin.js'; // <-- import here

const router = express.Router();

// Course Management
router.post('/course/new', isAuth, isAdmin, uploadFiles, createCourse);
router.post('/course/:id', isAuth, isAdmin, uploadFiles, addLectures);
router.delete('/course/:id', isAuth, isAdmin, deleteCourse);
router.put('/course/:id/toggle-coming-soon', isAuth, isAdmin, toggleComingSoon);
router.delete('/lecture/:id', isAuth, isAdmin, deleteLecture);

// Admin Stats & Users
router.get('/stats', isAuth, isAdmin, getAllStats);
router.get('/sales/total', isAuth, isAdmin, getTotalSales);
router.get('/sales/by-date', isAuth, isAdmin, getDailySales);
router.get('/users', isAuth, isAdmin, getAllUser);
router.put('/user/:id', isAuth, updateRole);
router.delete('/user/:id', isAuth, isAdmin, deleteUser);

// Category Management
router.post('/category', isAuth, isAdmin, createCategory);
router.get('/categories', isAuth, isAdmin, getAllCategories);
router.put('/category/:id', isAuth, isAdmin, updateCategory);
router.delete('/category/:id', isAuth, isAdmin, deleteCategory);

// Educator Management
router.post('/educator', isAuth, isAdmin, createEducator);
router.get('/educators', getAllEducators);
router.put('/educator/:id', isAuth, isAdmin, updateEducator);
router.delete('/educator/:id', isAuth, isAdmin, deleteEducator);

// Progress Management
router.delete('/progress/:id', isAuth, isAdmin, deleteProgress);  
export default router;
