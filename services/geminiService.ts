
import { GoogleGenAI, Modality, Type, GenerateContentResponse, Chat, FunctionDeclaration } from "@google/genai";

// --- IndexedDB Service ---
const DB_NAME = 'CreatorSpaceDB';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const MEDIA_STORE = 'mediaItems';

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(new Error('Failed to open IndexedDB.'));
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
                db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(MEDIA_STORE)) {
                const mediaStore = db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
                mediaStore.createIndex('projectId', 'projectId', { unique: false });
            }
        };
    });
    return dbPromise;
};

export const db = {
    getAll: async <T>(storeName: string): Promise<T[]> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onerror = () => reject(new Error(`Failed to get all from ${storeName}`));
            request.onsuccess = () => resolve(request.result);
        });
    },
    add: async <T>(storeName: string, item: T): Promise<void> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(item);
            request.onerror = () => reject(new Error(`Failed to add to ${storeName}`));
            request.onsuccess = () => resolve();
        });
    },
    put: async <T>(storeName: string, item: T): Promise<void> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(item);
            request.onerror = () => reject(new Error(`Failed to put in ${storeName}`));
            request.onsuccess = () => resolve();
        });
    },
};

// FIX: API key must be obtained from process.env.API_KEY.
const getApiKey = (): string => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not found in process.env.API_KEY. For video generation, ensure a key is selected in the UI.');
    }
    return apiKey;
};


// Fix: Define and export LiveSession type as it's not exported from the library.
const tempAi = new GoogleGenAI({ apiKey: "for-type-only" });
export type LiveSession = Awaited<ReturnType<typeof tempAi.live.connect>>;


// Helper to convert a file to a base64 string
export const fileToBase64 = (file: File, onProgress: (progress: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress(progress);
            }
        };

        reader.onload = () => {
            onProgress(100); // Ensure it completes to 100%
            resolve((reader.result as string).split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

// Helper function to convert data URL to Blob
export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return res.blob();
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

export const generateImage = async (prompt: string, aspectRatio: string, negativePrompt?: string, temperature?: number): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            ...(negativePrompt && { negativePrompt }),
            ...(temperature && { temperature }),
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
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

export const generateContent = async (parts: (string | { inlineData: { mimeType: string; data: string } })[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
    onStatusUpdate: (message: string, progress: number) => void
): Promise<{ objectUrl: string, blob: Blob }> => {
    // FIX: A new instance should be created before each call, and API key handling is moved to the component.
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    onStatusUpdate("Initializing video generation...", 10);
    
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

    onStatusUpdate("Generation in progress... this may take a few minutes.", 30);
    
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        onStatusUpdate("Checking status...", 60);
        // FIX: Remove specific API key error handling. The component will handle it.
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    
    onStatusUpdate("Finalizing video...", 80);
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed to produce a link.");
    
    onStatusUpdate("Downloading video data...", 95);
    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    const videoBlob = await videoResponse.blob();
    onStatusUpdate("Complete.", 100);
    
    return { objectUrl: URL.createObjectURL(videoBlob), blob: videoBlob };
};

export const createChatSession = (model: string, systemInstruction: string, tools?: {functionDeclarations: FunctionDeclaration[]}[], ): Chat => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const modelConfig = model === 'gemini-2.5-pro'
        ? { thinkingConfig: { thinkingBudget: 32768 } }
        : {};

    return ai.chats.create({
        model,
        config: {
            systemInstruction,
            ...modelConfig,
            ...(tools && { tools })
        },
    });
};

export const generateSpeech = async (text: string, voiceName: string): Promise<AudioBuffer> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
    onToolCall: (name: string, args: any, id: string) => void,
    tools?: {functionDeclarations: FunctionDeclaration[]}[],
): Promise<LiveSession> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    let currentInputTranscription = '';
    let currentOutputTranscription = '';
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => console.log('Conversation session opened.'),
            onmessage: async (message) => {
                 if (message.toolCall) {
                    for (const fc of message.toolCall.functionCalls) {
                        onToolCall(fc.name, fc.args, fc.id);
                    }
                }
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
            systemInstruction: "You are a friendly and helpful voice assistant. Keep your responses concise. When a tool is available, use it.",
            ...(tools && { tools })
        }
    });
};