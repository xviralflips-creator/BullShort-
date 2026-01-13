import { GoogleGenAI } from "@google/genai";
import { GenerationType, GenerationConfig } from "../types";

// Helper to check for API Key selection (required for Veo)
async function ensureApiKey() {
  // @ts-ignore
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
       // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  }
}

// Initialize client
// We create a fresh instance per request to ensure we capture the selected key if it changes
const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
  try {
    const ai = getClient();
    const model = 'gemini-3-flash-preview';
    const systemInstruction = "You are a professional film director and cinematographer. Enhance the user's prompt to be highly descriptive, focusing on lighting, camera angles, motion, texture, and mood. Keep it under 60 words. Output ONLY the enhanced prompt.";
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep thought for simple enhancement
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
  await ensureApiKey();
  const ai = getClient();
  
  // Using Imagen 3 models via generateImages
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: config.aspectRatio === '9:16' ? '9:16' : '16:9', // Map strictly
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
  await ensureApiKey();
  const ai = getClient();
  
  // Use fast preview for demo speed, or standard for quality
  const model = 'veo-3.1-fast-generate-preview'; 

  let operation;

  // Configuration mapping
  const veoConfig = {
    numberOfVideos: 1,
    resolution: config.resolution,
    aspectRatio: config.aspectRatio === '1:1' ? '16:9' : config.aspectRatio // Veo strict aspect ratios
  };

  if (inputImageBase64) {
    // Image-to-Video
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
    // Text-to-Video
    operation = await ai.models.generateVideos({
      model,
      prompt,
      config: veoConfig
    });
  }

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({ operation });
    console.log("Polling Veo status...", operation.metadata);
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed or returned no URI");

  // Construct accessible URL with API key
  return `${videoUri}&key=${process.env.API_KEY}`;
};

// Helper for file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix for API calls that just want the bytes
        // But for display we keep it. 
        // We will strip it in the service call if needed.
        resolve(result);
    };
    reader.onerror = error => reject(error);
  });
};
