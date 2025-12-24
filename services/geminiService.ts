import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { BusinessMetrics, Industry, ChatMessage } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatSession: Chat | null = null;
let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const initializeChat = (): void => {
  const client = getAIClient();
  chatSession = client.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, // Balance between creativity and analysis
    },
  });
};

const formatContext = (industry: Industry, metrics: BusinessMetrics): string => {
  return `
[CURRENT BUSINESS CONTEXT]
Industry: ${industry}
Revenue/Sales: ${metrics.revenue || 'Not provided'}
Expenses/Costs: ${metrics.expenses || 'Not provided'}
Customer Count: ${metrics.customerCount || 'Not provided'}
---------------------------------------------------
`;
};

export const sendMessageStream = async (
  userMessage: string,
  industry: Industry,
  metrics: BusinessMetrics,
  onChunk: (text: string) => void
): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session");
  }

  // We prepend the current context to the user message so the model is always up to date
  // with the latest sidebar inputs without needing to restart the session.
  const fullPrompt = `${formatContext(industry, metrics)}\nUser Query: ${userMessage}`;

  let fullResponse = "";

  try {
    const resultStream = await chatSession.sendMessageStream({ message: fullPrompt });

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text;
      if (text) {
        fullResponse += text;
        onChunk(fullResponse);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    const errorMessage = "\n\n(I encountered an error connecting to the analysis engine. Please try again.)";
    onChunk(fullResponse + errorMessage);
    return fullResponse + errorMessage;
  }

  return fullResponse;
};
