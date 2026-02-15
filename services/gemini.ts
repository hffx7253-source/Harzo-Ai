
import { GoogleGenAI } from "@google/genai";
import { GenerationSettings } from "../types";

export class GeminiService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async enhancePrompt(prompt: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional AI prompt engineer. Enhance the following simple prompt into a highly descriptive, cinematic, and detailed prompt for image generation. Include lighting, camera details, and artistic style. Output ONLY the enhanced prompt string.
      
      User Prompt: ${prompt}`,
    });
    return response.text?.trim() || prompt;
  }

  static async generateImage(prompt: string, settings: GenerationSettings) {
    const ai = this.getClient();
    const isUltraHD = settings.quality === 'Ultra HD';
    
    // Pro features check logic
    if (isUltraHD) {
      // Logic would go here to ensure key is selected if running in an env that requires it.
      // Based on instructions, Pro requires window.aistudio.hasSelectedApiKey checks.
    }

    const model = isUltraHD ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    const finalPrompt = `${prompt}. Style: ${settings.lighting || 'Cinematic'}. Camera: ${settings.camera || 'High-res'}. Negative: ${settings.negativePrompt}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: finalPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio === 'Custom' ? '1:1' : settings.aspectRatio as any,
          imageSize: isUltraHD ? '2K' : '1K'
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image was generated');
  }

  static async transformImage(image: string, prompt: string, settings: GenerationSettings) {
    const ai = this.getClient();
    const base64Data = image.split(',')[1];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png'
            }
          },
          { text: `Modify this image based on the following instruction: ${prompt}. Maintain consistency but apply the transformation with a strength of ${settings.strength}%. Lighting: ${settings.lighting || 'Cinematic'}.` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('Image transformation failed');
  }

  static async personaTransform(image: string, personaPrompt: string, settings: GenerationSettings) {
    const ai = this.getClient();
    const base64Data = image.split(',')[1];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png'
            }
          },
          { 
            text: `Persona Transformation: Take the person in this photo and reimagine them as: ${personaPrompt}. 
            Keep the basic facial structure if possible. Apply high-end cinematic lighting. 
            Instruction details: ${settings.negativePrompt ? 'Avoid: ' + settings.negativePrompt : ''}` 
          }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('Persona transformation failed');
  }
}
