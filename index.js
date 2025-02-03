import express from 'express'
import dotenv from 'dotenv'
import db from './libs/db.js'
import AuthRoutes from './routes/Authroutes.js'
import SchoolRoutes from './routes/Schoolroutes.js'


dotenv.config()
const PORT=process.env.PORT || 8000
db()
const app=express()
app.use(express.json())
app.use('/auth',AuthRoutes)
app.use('/school',SchoolRoutes)


app.listen(PORT,()=>{
    console.log(`App is running on port ${PORT}`)
})