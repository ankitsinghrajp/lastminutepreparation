import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const corsOptions = {
    origin:process.env.FRONTEND_URL,
    credentials:true
}

const app = express();

app.use(cors(corsOptions));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"))
app.use(cookieParser());

export {app};