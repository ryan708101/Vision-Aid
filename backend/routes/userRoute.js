import express from 'express';
import upload from '../middlewares/multer.js';
import authUser from '../middlewares/authUser.js';
import { forgeUserData, getUser, handleGameCompletion, loginUser, registerUser, updateDetectedDisease, updateProfile } from '../controllers/userController.js';

const userRouter = express.Router();

// userRouter.post('/register', upload.single('none'), registerUser);
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/getUser',authUser, getUser);
userRouter.post('/updateProfile', upload.single('image'),authUser, updateProfile);
userRouter.post('/updateDisease', authUser, updateDetectedDisease);
userRouter.post('/handleGameCompletion', authUser, handleGameCompletion);
userRouter.get('/forgeData', authUser, forgeUserData);



export default userRouter;
