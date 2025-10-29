import { app } from "./app.js";
import { configDotenv } from "dotenv";
import { connectDb } from "./src/db/connectDb.js";
configDotenv();
connectDb()
.then(()=>{
   app.listen(process.env.PORT || 8000,()=>{
    console.log("The server is running on port: ",process.env.PORT);
   })
})
.catch(()=>{
     console.log("Database connection failed!");
})
