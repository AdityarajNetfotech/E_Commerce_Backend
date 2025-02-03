import mongoose from 'mongoose'

const db=async()=>{
    try{
        mongoose.connect(process.env.MONGODB_URL)
        console.log('MongoDb is connected')
    }catch(error){
        console.log('MongoDb is not connected')
    }
}

export default db


