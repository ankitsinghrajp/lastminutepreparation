import { GoogleGenerativeAI } from "@google/generative-ai";
import { configDotenv } from "dotenv";
configDotenv();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const askGemini = async(prompt, model = "gemini-2.5-flash") =>{
    const modelInstance = genAI.getGenerativeModel({model});
    const result = await modelInstance.generateContent(prompt);
    return result.response.text();
}