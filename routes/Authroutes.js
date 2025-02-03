import express from 'express'
import { register,VerifyEmail,login,logout,getAllUsers,deleteUser,updateUserDetails} from '../controllers/Auth.js'
const AuthRoutes=express.Router()

AuthRoutes.post('/register',register)
AuthRoutes.post('/verifyEmail',VerifyEmail)
AuthRoutes.post('/login',login)
AuthRoutes.post('/logout',logout)
AuthRoutes.get('/getAllUsers',getAllUsers)
AuthRoutes.delete('/users/:userId',deleteUser);
AuthRoutes.put('/Userupdate/:userId',updateUserDetails);
export default AuthRoutes
