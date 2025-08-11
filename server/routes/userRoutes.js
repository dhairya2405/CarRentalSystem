import express from "express";
import { getCars, getUSerData, loginUser, registerUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/data',protect,getUSerData)
userRouter.get('/cars',getCars)

export default userRouter