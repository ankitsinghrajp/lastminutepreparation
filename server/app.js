import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { inngestHandler } from "./src/inngest/route.js";
import helmet from "helmet";

const corsOptions = {
    origin:["http://localhost:5173",
        process.env.FRONTEND_URL
    ],
    credentials:true
}

const app = express();

app.use(cors(corsOptions));
app.use(express.json({limit:"50mb"}));
app.use(helmet());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"))
app.use(cookieParser());

// Import routes 
import userRoutes from "./src/routes/user.route.js";
import authRoutes from "./src/routes/auth.route.js";
import aiRoutes from "./src/routes/ai.route.js";
import classRoutes from "./src/routes/class.route.js";
import paymentRoutes from "./src/routes/payment.route.js";

// Configure routes
app.use("/api/v1/user",userRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/v1/ai",aiRoutes);
app.use("/api/v1/info",classRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/inngest",inngestHandler);

export {app};