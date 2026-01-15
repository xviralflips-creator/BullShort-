import { GoogleGenAI } from "@google/genai";
import { GenerationType, GenerationConfig } from "../types";

// Helper to ensure API Key selection for Veo models
export async function checkAndPromptKey() {
  // @ts-ignore
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      return true; // Assume success after opening dialog as per instructions
    }
    return true;
  }
  return true;
}

export const enhancePrompt = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const systemInstruction = "You are a professional film director and cinematographer. Enhance the user's prompt to be highly descriptive, focusing on lighting, camera angles, motion, texture, and mood. Keep it under 60 words. Output ONLY the enhanced prompt.";
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || prompt;
  } catch (error) {
    console.warn("Prompt enhancement failed, using original.", error);
    return prompt;
  }
};

export const generateImage = async (
  prompt: string, 
  config: GenerationConfig
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: config.aspectRatio === '9:16' ? '9:16' : '16:9',
      outputMimeType: 'image/jpeg'
    }
  });

  const base64String = response.generatedImages?.[0]?.image?.imageBytes;
  if (!base64String) throw new Error("No image generated");
  
  return `data:image/jpeg;base64,${base64String}`;
};

export const generateVideo = async (
  prompt: string,
  config: GenerationConfig,
  inputImageBase64?: string,
  inputImageMimeType?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'veo-3.1-fast-generate-preview'; 

  const veoConfig = {
    numberOfVideos: 1,
    resolution: config.resolution,
    aspectRatio: config.aspectRatio === '1:1' ? '16:9' : config.aspectRatio
  };

  try {
    let operation;
    if (inputImageBase64) {
      operation = await ai.models.generateVideos({
        model,
        prompt: prompt || "Animate this image cinematically.",
        image: {
          imageBytes: inputImageBase64,
          mimeType: inputImageMimeType || 'image/png'
        },
        config: veoConfig
      });
    } else {
      operation = await ai.models.generateVideos({
        model,
        prompt,
        config: veoConfig
      });
    }

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed: No URI returned");

    // Fetch the video data to create a local blob URL
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      // @ts-ignore
      if (window.aistudio?.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    }
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
