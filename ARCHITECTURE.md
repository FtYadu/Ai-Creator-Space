# AI Creator Space Architecture

## Overview

AI Creator Space is a modern web application built with React, TypeScript, and Google's Gemini AI models. It provides a comprehensive suite of tools for AI-powered content creation.

## Technology Stack

### Frontend
- **React 19.2.0** - UI framework
- **TypeScript 5.8.2** - Type-safe JavaScript
- **Vite 6.2.0** - Build tool and dev server
- **Tailwind CSS** (via CDN) - Utility-first CSS framework

### AI/ML Integration
- **@google/genai 1.27.0** - Google Gemini API SDK
- Supports multiple models:
  - `gemini-2.5-pro` - Advanced reasoning and analysis
  - `gemini-2.5-flash` - Fast, efficient processing
  - `imagen-4.0` - Image generation
  - `veo-3.1` - Video generation

### Data Persistence
- **IndexedDB** - Client-side database for projects and media
- **localStorage** - User settings and preferences

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **@testing-library/react** - React testing utilities

## Application Architecture

### Component Structure

```
App (Main Application)
├── Settings & Theme Management
├── Navigation Sidebar
│   ├── User Profile
│   ├── Tool Navigation
│   └── Settings/Notifications
├── Dashboard (Default View)
│   └── Tool Cards (Draggable)
└── Tool View (Active Tool)
    ├── Error Boundary
    └── Tool-Specific Component
        ├── Image Generator
        ├── Image Editor
        ├── Image Analyzer
        ├── Video Generator
        ├── Video Analyzer
        ├── Voice Assistant
        ├── Text-to-Speech
        ├── Chat Assistant
        └── Projects Dashboard
```

### Data Flow

1. **User Input** → Component State
2. **API Call** → Gemini Service
3. **Response** → State Update
4. **Persistence** → IndexedDB/localStorage
5. **UI Update** → React Re-render

### State Management

The application uses React hooks for state management:

- **useState** - Local component state
- **useEffect** - Side effects and lifecycle
- **useRef** - DOM references and mutable values
- **useCallback** - Memoized callbacks

### Key State Variables

```typescript
// App.tsx
const [activeTool, setActiveTool] = useState<Tool | null>(null);
const [projects, setProjects] = useState<Project[]>([]);
const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
const [notifications, setNotifications] = useState<Notification[]>([]);
```

## Core Services

### Gemini Service (`services/geminiService.ts`)

Handles all interactions with Google's Gemini API:

#### Image Operations
- `generateImage()` - Create images with Imagen
- `editImage()` - Modify existing images
- `generateContent()` - General content generation

#### Video Operations
- `generateVideo()` - Create videos with Veo
- Uses polling mechanism for long-running operations
- Progress tracking via callbacks

#### Chat & Voice
- `createChatSession()` - Multi-turn conversations
- `startConversationSession()` - Real-time voice chat with Gemini Live
- `generateSpeech()` - Text-to-speech synthesis

#### Function Calling
- Weather tool example implementation
- Extensible tool system for custom functions

### IndexedDB Service

Custom wrapper around IndexedDB for data persistence:

```typescript
{
  getAll: <T>(storeName: string): Promise<T[]>
  add: <T>(storeName: string, item: T): Promise<void>
  put: <T>(storeName: string, item: T): Promise<void>
  delete: (storeName: string, key: string): Promise<void>
  getByIndex: <T>(storeName, indexName, value): Promise<T[]>
}
```

**Object Stores:**
- `projects` - User projects
- `mediaItems` - Generated media (images, videos, chat history)

## Features

### 1. Image Generation
- Text-to-image with Imagen 4.0
- Aspect ratio selection (1:1, 3:4, 4:3, 9:16, 16:9)
- Negative prompts
- Creativity control (temperature)

### 2. Image Editing
- Text-based image modifications
- Uses Gemini 2.5 Flash with image modality

### 3. Image Analysis
- Upload images for AI analysis
- Custom analysis prompts
- Detailed insights and descriptions

### 4. Video Generation
- Text-to-video with Veo 3.1
- Optional starting image
- Aspect ratio selection (16:9, 9:16)
- Progress tracking during generation

### 5. Video Analysis
- Frame extraction (8 frames per video)
- Multi-frame analysis
- Content summarization

### 6. Voice Assistant
- Real-time voice conversations
- Uses Gemini Live API
- Audio input/output streaming
- Transcription display
- Function calling support

### 7. Text-to-Speech
- Natural-sounding speech generation
- Multiple voice options
- Gemini 2.5 Flash TTS model

### 8. Chat Assistant
- Multi-turn conversations
- Function calling with weather tool
- Message history
- Image attachments

### 9. Projects Manager
- Organize media by project
- Project CRUD operations (create, read, update, delete)
- Media library with thumbnails
- Delete individual media items

## Error Handling

### Error Boundary
React error boundary catches and displays errors gracefully:

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  // Displays error UI with retry option
}
```

### API Error Handling
- Try-catch blocks around all API calls
- User-friendly error messages
- Loading states during operations
- Retry mechanisms for network failures

## Accessibility Features

- **Keyboard Navigation** - Full keyboard support
- **Focus Traps** - Modal dialogs trap focus
- **ARIA Labels** - Proper accessibility labels
- **Screen Reader Support** - Semantic HTML
- **Dark Mode** - Theme switching support

## Performance Optimization

### Code Splitting
- Dynamic imports for tool components
- Lazy loading of heavy dependencies

### Asset Optimization
- Blob storage for images/videos
- URL.createObjectURL for efficient rendering
- Proper cleanup to prevent memory leaks

### Caching
- IndexedDB for persistent data
- localStorage for settings
- Browser caching for static assets

## Security Considerations

- API keys from environment variables only
- No hardcoded credentials
- Input validation and sanitization
- Content Security Policy headers (recommended)
- Rate limiting awareness

## Build & Deployment

### Development
```bash
npm run dev
```
Runs on `http://0.0.0.0:3000`

### Production Build
```bash
npm run build
```
Output: `dist/` directory

### Preview Production Build
```bash
npm run preview
```

## Future Enhancements

- [ ] Search and filter functionality
- [ ] Data export/backup
- [ ] Pagination for large media libraries
- [ ] Keyboard shortcuts
- [ ] Real weather API integration
- [ ] Media preview lightbox
- [ ] Collaborative features
- [ ] Cloud sync
- [ ] Mobile app

## Monitoring & Analytics

Currently not implemented. Recommended additions:
- Error tracking (e.g., Sentry)
- Performance monitoring (e.g., Web Vitals)
- Usage analytics (privacy-friendly)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and how to contribute to the project.
