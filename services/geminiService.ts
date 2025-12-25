
import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const refineLayoutContent = async (title: string, description: string): Promise<AISuggestion> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a professional copywriter and UI designer. 
    Analyze the following brief:
    Title: "${title}"
    Description: "${description}"
    
    Task:
    1. Refine the title to be punchy and professional.
    2. Expand the description into a compelling sub-header.
    3. Generate 3 distinct content sections (heading and body text) that would fit a modern landing page or presentation for this topic.
    4. Suggest a vibrant primary HEX theme color.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          refinedTitle: { type: Type.STRING },
          refinedDescription: { type: Type.STRING },
          suggestedTheme: { type: Type.STRING, description: "A HEX color code like #6366f1" },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                body: { type: Type.STRING }
              },
              required: ["heading", "body"]
            }
          }
        },
        required: ["refinedTitle", "refinedDescription", "suggestedTheme", "sections"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as AISuggestion;
};

export const generateImageFromDescription = async (prompt: string, title?: string): Promise<string | null> => {
  try {
    const fullPrompt = `High-end, professional, editorial photography for a web layout. 
    Subject: ${title || 'Background'}. 
    Context: ${prompt}. 
    Style: Minimalist, cinematic lighting, shallow depth of field, high resolution 4k. No text, no logos.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};
