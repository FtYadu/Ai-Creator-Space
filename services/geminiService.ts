
import { GoogleGenAI, Modality, Type, GenerateContentResponse, LiveSession, Chat } from "@google/genai";

// Helper to convert a file to a base64 string
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

// --- Audio Decoding for TTS & Live API ---
const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
};

// --- Gemini API Calls ---

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error('No image generated');
};

export const analyzeContent = async (parts: (string | { inlineData: { mimeType: string; data: string } })[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const formattedParts = parts.map(part => typeof part === 'string' ? { text: part } : part);
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: formattedParts },
    });
    return response.text;
};

export const generateVideo = async (
    prompt: string,
    image: { base64: string; mimeType: string } | null,
    aspectRatio: "16:9" | "9:16",
    onStatusUpdate: (message: string) => void
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    onStatusUpdate("Initializing video generation...");
    
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        ...(image && { image: { imageBytes: image.base64, mimeType: image.mimeType } }),
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    onStatusUpdate("Generation in progress... this may take a few minutes.");
    
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        onStatusUpdate("Checking status...");
        try {
            operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (error: any) {
            if (error.message?.includes('Requested entity was not found')) {
                 throw new Error('API key error. Please re-select your key.');
            }
            throw error;
        }
    }
    
    onStatusUpdate("Finalizing video...");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed to produce a link.");
    
    onStatusUpdate("Downloading video data...");
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    
    return URL.createObjectURL(videoBlob);
};

export const createChatSession = (model: string, systemInstruction: string): Chat => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelConfig = model === 'gemini-2.5-pro'
        ? { thinkingConfig: { thinkingBudget: 32768 } }
        : {};

    return ai.chats.create({
        model,
        config: {
            systemInstruction,
            ...modelConfig,
        },
    });
};

export const generateSpeech = async (text: string, voiceName: string): Promise<AudioBuffer> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName } },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBytes = decode(base64Audio);
    return decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
};

export const startConversationSession = (
    onTranscriptionUpdate: (text: string, isFinal: boolean, isModel: boolean) => void,
    onAudioOutput: (audioBuffer: AudioBuffer) => void,
    onInterrupted: () => void,
): Promise<LiveSession> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let currentInputTranscription = '';
    let currentOutputTranscription = '';
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => console.log('Conversation session opened.'),
            onmessage: async (message) => {
                // Handle transcriptions
                if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    currentInputTranscription += text;
                    onTranscriptionUpdate(currentInputTranscription, false, false);
                }
                 if (message.serverContent?.outputTranscription) {
                    const text = message.serverContent.outputTranscription.text;
                    currentOutputTranscription += text;
                    onTranscriptionUpdate(currentOutputTranscription, false, true);
                }
                if (message.serverContent?.turnComplete) {
                    onTranscriptionUpdate(currentInputTranscription, true, false);
                    onTranscriptionUpdate(currentOutputTranscription, true, true);
                    currentInputTranscription = '';
                    currentOutputTranscription = '';
                }
                
                // Handle audio output
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    const audioBytes = decode(base64Audio);
                    const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
                    onAudioOutput(audioBuffer);
                }
                
                if (message.serverContent?.interrupted) {
                    onInterrupted();
                }
            },
            onerror: (e) => console.error('Conversation error:', e),
            onclose: (e) => console.log('Conversation session closed.'),
        },
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: "You are a friendly and helpful voice assistant. Keep your responses concise."
        }
    });
};
