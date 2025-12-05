import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function askFaithQuestion(question: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful, knowledgeable assistant for an Ethiopian Orthodox Church Finder app. 
      Answer the following question about the Ethiopian Orthodox Tewahedo Church faith, traditions, holidays, or etiquette briefly and respectfully (max 100 words).
      
      Question: ${question}`,
    });
    return response.text || "I apologize, I couldn't generate an answer at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am having trouble connecting to the knowledge base right now.";
  }
}
