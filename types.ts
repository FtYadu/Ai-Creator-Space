
export enum Tool {
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  IMAGE_GEN = 'IMAGE_GEN',
  IMAGE_EDIT = 'IMAGE_EDIT',
  IMAGE_ANALYZE = 'IMAGE_ANALYZE',
  VIDEO_GEN = 'VIDEO_GEN',
  VIDEO_ANALYZE = 'VIDEO_ANALYZE',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
  TTS = 'TTS',
  CHAT = 'CHAT',
}

export type Theme = 'light' | 'dark';

export interface UserProfile {
  name: string;
  avatar: string; // base64 string
}

export interface ApiConfigs {
  // geminiApiKey is removed as per security guidelines. API key should come from process.env.
}

export interface Settings {
  userProfile: UserProfile;
  apiConfigs: ApiConfigs;
  theme: Theme;
}

// --- Notification Center ---
export interface Notification {
    id: number;
    message: string;
    timestamp: string;
    read: boolean;
}

// --- Projects & Media Library ---
export interface Project {
    id: string;
    name: string;
    createdAt: string;
}

export type MediaType = 'image' | 'video' | 'chat';

interface BaseMediaItem {
    id: string;
    projectId: string;
    type: MediaType;
    createdAt: string;
    prompt?: string;
}

export interface ImageMediaItem extends BaseMediaItem {
    type: 'image';
    data: Blob;
}

export interface VideoMediaItem extends BaseMediaItem {
    type: 'video';
    data: Blob;
}

export interface ChatMediaItem extends BaseMediaItem {
    type: 'chat';
    messages: DisplayMessage[];
}

export type MediaItem = ImageMediaItem | VideoMediaItem | ChatMediaItem;

// FIX: Define a new type for creating media items to solve issues with Omit on union types.
export type MediaItemData =
    | Omit<ImageMediaItem, 'id' | 'projectId' | 'createdAt'>
    | Omit<VideoMediaItem, 'id' | 'projectId' | 'createdAt'>
    | Omit<ChatMediaItem, 'id' | 'projectId' | 'createdAt'>;

// --- Chat & Function Calling ---
export type MessagePart = 
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
    | { functionCall: { name: string, args: any } }
    | { functionResponse: { name: string, response: any } };

export interface DisplayMessage {
    id: string;
    role: 'user' | 'model' | 'tool';
    parts: MessagePart[];
}