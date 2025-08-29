
import { GoogleGenAI } from "@google/genai";
import type { DataLog } from '../types';

if (!process.env.API_KEY) {
    // In a real app, this would be a fatal error.
    // Here we provide a mock for environments where the key isn't set.
    console.warn("API_KEY environment variable not set. Using mock service.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "mock_key" });

export async function* getAIResponseStream(
  systemPersona: string,
  dataLogs: DataLog[],
  playerQuery: string
): AsyncGenerator<string> {

  if (!process.env.API_KEY) {
      const mockResponse = `// MOCK RESPONSE: API KEY NOT FOUND.
// Persona: ${systemPersona.substring(0, 50)}...
// Query: ${playerQuery}`;
      for (let i = 0; i < mockResponse.length; i++) {
        await new Promise(res => setTimeout(res, 10));
        yield mockResponse[i];
      }
      return;
  }

  const context = dataLogs
    .map(log => `DATA LOG: "${log.title}"\n${log.content}`)
    .join('\n\n---\n\n');

  const fullPrompt = `CONTEXT:\n${context}\n\nUSER QUERY:\n${playerQuery}`;

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: systemPersona,
      }
    });

    for await (const chunk of stream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        yield `// GEMINI API ERROR: ${error.message}`;
    } else {
        yield `// GEMINI API ERROR: An unknown error occurred.`;
    }
  }
}
