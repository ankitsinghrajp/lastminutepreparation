// import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { configDotenv } from "dotenv";
configDotenv();



// const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

// export const askOpenAI = async (prompt, model = "gpt-4o-mini") =>{
//       const res = await openai.chat.completions.create({
//         model,
//         messages:[{role: "user", content: prompt}],
//         temperature: 0.5,
//       });
//       return res.choices[0].message.content;
// };



