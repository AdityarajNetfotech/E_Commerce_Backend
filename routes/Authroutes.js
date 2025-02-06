import express from 'express'
import { register,VerifyEmail,login,logout,getAllUsers,deleteUser,updateUserDetails,resendOtp,forgetPassword, verifyOTP, resetPassword} from '../controllers/Auth.js'
const AuthRoutes=express.Router()

AuthRoutes.post('/register',register)
AuthRoutes.post('/verifyEmail',VerifyEmail)
AuthRoutes.post('/resendOtp',resendOtp)
AuthRoutes.post('/login',login)
AuthRoutes.post('/logout',logout)
AuthRoutes.get('/getAllUsers',getAllUsers)
AuthRoutes.delete('/users/:userId',deleteUser);
AuthRoutes.put('/Userupdate/:userId',updateUserDetails);
AuthRoutes.post('/forget-password', forgetPassword);
AuthRoutes.post('/verify-otp', verifyOTP);
AuthRoutes.post('/reset-password', resetPassword);
export default AuthRoutes
