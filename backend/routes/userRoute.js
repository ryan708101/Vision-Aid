import express from 'express';
import upload from '../middlewares/multer.js';
import authUser from '../middlewares/authUser.js';
import { forgeData, getUser, handleChallengeCompletion, handleGameCompletion, loginUser, registerUser, updateDetectedDisease, updateProfile } from '../controllers/userController.js';

const userRouter = express.Router();

// userRouter.post('/register', upload.single('none'), registerUser);
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/getUser',authUser, getUser);
userRouter.post('/handleChallengeCompletion',authUser, handleChallengeCompletion)
userRouter.post('/updateProfile', upload.single('image'),authUser, updateProfile);
userRouter.get('/forgeData',authUser, forgeData)
userRouter.post('/updateDisease', authUser, updateDetectedDisease);
userRouter.post('/handleGameCompletion', authUser, handleGameCompletion);



export default userRouter;
