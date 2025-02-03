import nodemailer from "nodemailer"
export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "aditya@netfotech.in",
      pass: "upom uggi rscg sebm",
    },
  });

  const SendEmail=async()=>{
    try{
        const info = await transporter.sendMail({
            from: '"Netfotect solution 👻" <aditya@netfotech.in>', // sender address
            to: "adityaraj766711@gmail.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
          });
          console.log(info)
    } catch(error){
        console.log(error)
    }
  }
  SendEmail()