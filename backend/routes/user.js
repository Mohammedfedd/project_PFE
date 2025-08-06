import express from 'express';
import { loginUser, myProfile, register, verifyUser, editUserProfile,forgotPassword,resetPassword } from '../controller/user.js';
import { isAuth } from '../middlewares/isAuth.js';
import { addProgress, getYourProgress } from "../controller/course.js";
import {generateCertificate,getUserCertificates} from "../controller/user.js"
const router = express.Router();

router.post('/user/register', register);
router.post('/user/verify', verifyUser);
router.post('/user/login', loginUser);
router.get('/user/me', isAuth, myProfile);
router.put('/user/edit-profile', isAuth, editUserProfile);
router.post("/user/progress", isAuth, addProgress);
router.get("/user/progress", isAuth, getYourProgress);
router.post('/user/generate-certificate', isAuth, generateCertificate);
router.get('/user/certificates', isAuth, getUserCertificates);
router.post("/user/forgot", forgotPassword);
router.post("/user/reset", resetPassword);

export default router;
