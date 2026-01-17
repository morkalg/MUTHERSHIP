
import { GoogleGenAI } from "@google/genai";
import type { DataLog, ShipSystem } from '../types';

if (!process.env.API_KEY) {
  // In a real app, this would be a fatal error.
  // Here we provide a mock for environments where the key isn't set.
  console.warn("API_KEY environment variable not set. Using mock service.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "mock_key" });

export async function* getAIResponseStream(
  systemPersona: string,
  dataLogs: DataLog[],
  shipSystems: ShipSystem[],
  playerQuery: string
): AsyncGenerator<string> {

  if (!process.env.API_KEY) {
    let mockResponse = `UNABLE TO COMPLY. NETWORK TRACE FAILED. CHECK HARDWARE CONFIGURATION.
(SYSTEM NOTE: API KEY NOT FOUND. PLEASE CONFIGURE "API_KEY" IN ENVIRONMENT VARIABLES TO ENABLE AI PROCESSING.)`;

    // Mock logic for testing visuals without API Key
    const query = playerQuery.toUpperCase();
    const matchedSystem = shipSystems.find(s => query.includes(s.name));

    if (matchedSystem) {
      mockResponse = `RETRIEVING TECHNICAL DATA FOR ${matchedSystem.name}...\n\nSTATUS: ${matchedSystem.status}\nDETAILS: ${matchedSystem.details}\n\n[DISPLAY_SYSTEM: ${matchedSystem.name}]`;
    }

    for (let i = 0; i < mockResponse.length; i++) {
      await new Promise(res => setTimeout(res, 10));
      yield mockResponse[i];
    }
    return;
  }

  const logContext = dataLogs
    .map(log => `DATA LOG: "${log.title}"\n${log.content}`)
    .join('\n\n---\n\n');

  const systemContext = shipSystems
    .map(sys => `SYSTEM: ${sys.name}\nSTATUS: ${sys.status}\nDETAILS: ${sys.details}`)
    .join('\n\n');

  const fullPrompt = `CONTEXT:\n${logContext}\n\nSHIP SYSTEMS STATUS:\n${systemContext}\n\nUSER QUERY:\n${playerQuery}\n\nINSTRUCTIONS: If the user query relates to a ship system, include a technical status report. You can trigger a visual diagnostic by appending the tag [DISPLAY_SYSTEM: <SYSTEM_NAME>] at the end of your response. <SYSTEM_NAME> must match one of the system names provided exactly.`;

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
