import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, CustomInstructions } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function formatChatHistoryForApi(chatHistory: ChatMessage[]) {
    return chatHistory.map(message => ({
        role: message.role === 'system' ? 'user' : message.role, // API doesn't have 'system' role, treat as user context
        parts: [{ text: message.content }]
    }));
}

export const generateResponse = async (chatHistory: ChatMessage[], instructions: CustomInstructions): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        
        let systemInstruction = "";
        if (instructions.system) systemInstruction += `SYSTEM Persona: ${instructions.system}\n`;
        if (instructions.ai) systemInstruction += `AI Behavior: ${instructions.ai}\n`;
        if (instructions.user) systemInstruction += `USER Context: ${instructions.user}`;

        const contents = formatChatHistoryForApi(chatHistory);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                ...(systemInstruction.trim() && { systemInstruction: systemInstruction.trim() })
            }
        });
        
        return response.text;

    } catch (error) {
        console.error("Gemini API Error:", error);
        if (error instanceof Error) {
            return `Error: Could not get a response from the AI. Details: ${error.message}`;
        }
        return "An unknown error occurred while contacting the AI.";
    }
};