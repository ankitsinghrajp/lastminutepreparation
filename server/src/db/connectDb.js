import mongoose from "mongoose";

const connectDb = async ()=>{
     try {
        const result = await mongoose.connect(`${process.env.DATABASE_URL}/${process.env.DB_NAME}`);
        console.log("The Database connection successfull!");
        console.log("DB HOST: ", result.connection.host);

     } catch (error) {
        console.log("Database connection failed!");
        process.exit(1);
     }
}
export {connectDb};