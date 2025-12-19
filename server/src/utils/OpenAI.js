import OpenAI from "openai";

import { configDotenv } from "dotenv";
configDotenv();

export const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export const askOpenAI = async (prompt, model = "gpt-5.1") =>{
      const res = await openai.chat.completions.create({
        model,
        messages:[{role: "user", content: prompt}],
      });
      return res.choices[0].message.content;
};


export const askOpenAIImage = async (prompt, fileBuffer, model = "gpt-4o-mini") => {
  try {
   
    const uploadedFile = await openai.files.create({
      file: fileBuffer,       // buffer from memoryStorage
      purpose: "vision"        // required for image analysis
    });

    const fileId = uploadedFile.id;

    const res = await openai.responses.create({
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image: fileId }  // use uploaded fileId
          ]
        }
      ],
      max_output_tokens: 800
    });

    return res.output[0].content;
  } catch (error) {
    console.error("OpenAI image analysis error:", error);
    throw error;
  }
};


