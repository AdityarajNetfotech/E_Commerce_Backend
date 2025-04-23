import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import db from "./libs/db.js";
import session from "express-session";

// ✅ Corrected ES Module imports for routes
import adminRoutes from "./routes/Adminroutes.js";
import schoolRoutes from "./routes/Schoolroutes.js";
import productRoutes from "./routes/Productroutes.js";
import studentRoutes from "./routes/Studentroutes.js";
import orderRoutes from "./routes/orderRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import googleRoute from "./routes/GoogleRoute.js"
import paymentRoutes from "./routes/paymentRoutes.js"; 


dotenv.config();
const PORT = process.env.PORT || 8000;
db();

const app = express();

app.use(
  cors({
    origin: "https://e-commerce-frontend-hvyt.vercel.app/", // Allow only your frontend URL
    credentials: true, // Allow cookies and authentication headers
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  })
);

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Change to `true` if using HTTPS
  })
);

app.use(express.json());

// ✅ Corrected ES Module usage for route imports
app.use("/api/admin", adminRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/product", productRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/googleAuth", googleRoute);
app.use("/api/payment", paymentRoutes);


app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
