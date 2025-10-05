import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(process.env.GOOGLE_GEMINI_KEY);


async function generateContent(prompt){
    const result = await model.generateContent(prompt);

    return result.response.text();
}

module.exports = generateContent