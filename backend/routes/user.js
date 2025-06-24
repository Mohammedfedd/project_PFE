import express from 'express';
import { loginUser, myProfile, register, verifyUser, editUserProfile } from '../controller/user.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/user/register', register);
router.post('/user/verify', verifyUser);
router.post('/user/login', loginUser);
router.get('/user/me', isAuth, myProfile);
router.put('/user/edit-profile', isAuth, editUserProfile);

export default router;
