import { transporter } from "./EmailConfig.js";
export const sendVerificationCode=async(email,verificationCode)=>{
    try{
         const response = await transporter.sendMail({
                    from: '"Netfotect solution 👻" <aditya@netfotech.in>', // sender address
                    to: email, // list of receivers
                    subject: "Verify your email", // Subject line
                    text: "Verify your email", // plain text body
                    html: verificationCode // html body
        });
        console.log('Email Send Succesfully',response)
    }catch(error){
        console.log('Email error')
    }
}