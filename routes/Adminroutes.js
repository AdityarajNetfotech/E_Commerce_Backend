import express from 'express'
import { registerAdmin,loginAdmin } from '../controllers/AdminAuth.js'

const AdminRoutes=express.Router()

AdminRoutes.post('/register',registerAdmin)
AdminRoutes.post('/login',loginAdmin)

export default AdminRoutes