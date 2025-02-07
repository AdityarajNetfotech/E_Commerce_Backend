import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors';
import db from './libs/db.js'
import AuthRoutes from './routes/Authroutes.js'
import SchoolRoutes from './routes/Schoolroutes.js'
import AdminRoutes from './routes/Adminroutes.js'
import session from "express-session"


dotenv.config()
const PORT=process.env.PORT || 8000
db()
const app=express()
app.use(cors({
    origin: "http://localhost:5173", // Allow only your frontend URL
    credentials: true, // Allow cookies and authentication headers
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  })); 
  app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change to `true` if using HTTPS
}));
app.use(express.json())
app.use('/auth',AuthRoutes)
app.use('/school',SchoolRoutes)
app.use('/admin',AdminRoutes)


app.listen(PORT,()=>{
    console.log(`App is running on port ${PORT}`)
})