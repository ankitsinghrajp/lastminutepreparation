import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const corsOptions = {
    origin:["http://localhost:5173",
        process.env.FRONTEND_URL
    ],
    credentials:true
}

const app = express();

app.use(cors(corsOptions));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"))
app.use(cookieParser());

// Import routes 
import userRoutes from "./src/routes/user.route.js";
import authRoutes from "./src/routes/auth.route.js";


// Configure routes
app.use("/api/v1/user",userRoutes);
app.use("/api/auth",authRoutes);
export {app};