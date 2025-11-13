<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Creator Space

A comprehensive suite of AI-powered tools for content creation, built with React and Google's Gemini AI models.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg)](https://reactjs.org/)

## Features

### 🎨 Image Tools

- **Generate Images** - Create stunning visuals from text prompts using Imagen 4.0
- **Edit Images** - Modify images with intuitive text commands
- **Analyze Images** - Get detailed AI-powered insights and analysis

### 🎬 Video Tools

- **Generate Videos** - Bring ideas to life with text-to-video using Veo 3.1
- **Analyze Videos** - Extract key information and understand video content

### 🎙️ Voice & Audio

- **Voice Assistant** - Real-time voice conversations with Gemini Live
- **Text-to-Speech** - Generate natural-sounding speech from any text

### 💬 Communication

- **Chat Assistant** - Multi-turn conversations with AI assistance
- **Function Calling** - Extensible tool system for custom capabilities

### 📁 Project Management

- **Organize Work** - Manage creations by project
- **Media Library** - View and manage all generated content
- **CRUD Operations** - Create, rename, and delete projects

## Tech Stack

- **Frontend**: React 19.2, TypeScript 5.8, Vite 6.2
- **Styling**: Tailwind CSS (glassmorphism design)
- **AI/ML**: Google Gemini API (@google/genai v1.27.0)
- **Storage**: IndexedDB, localStorage
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Quick Start

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Ai-Creator-Space
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Gemini API key:

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking

# Deployment
npm run validate     # Run all checks before deployment
npm run pre-deploy   # Comprehensive pre-deployment validation
npm run deploy:vercel # Deploy to Vercel
npm run deploy:docker # Deploy using Docker
```

## Deployment

### Quick Deploy to Vercel (Recommended)

```bash
# 1. Set your API key
export VITE_GEMINI_API_KEY=your_api_key_here

# 2. Deploy
npm run deploy:vercel
```

### Deploy with Docker

```bash
# 1. Create .env file with your API keys
echo "VITE_GEMINI_API_KEY=your_key" > .env

# 2. Deploy
npm run deploy:docker
```

### Other Options

For complete deployment guides including Netlify, AWS, Google Cloud, and more, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Pre-Deployment Checklist

```bash
# Run comprehensive validation
npm run pre-deploy
```

This will check:

- ✅ Node.js version
- ✅ Environment variables
- ✅ Dependencies
- ✅ Type checking
- ✅ Linting
- ✅ Tests
- ✅ Build
- ✅ Required files

## Project Structure

```
Ai-Creator-Space/
├── App.tsx                    # Main application component
├── index.tsx                  # React entry point
├── types.ts                   # TypeScript type definitions
├── services/
│   └── geminiService.ts       # Gemini API integration
├── tests/                     # Test files
├── .env.example              # Environment variables template
├── package.json              # Dependencies and scripts
├── CONTRIBUTING.md           # Contribution guidelines
├── ARCHITECTURE.md           # Architecture documentation
└── README.md                 # This file
```

## View in AI Studio

This app is available in Google AI Studio:
[View App](https://ai.studio/apps/drive/11USIl3rTpVXvA4OyXAMN0GeBmy2QsQ2s)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

For questions, issues, or feature requests:

- Open an issue on GitHub
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for development help

---

Made with ❤️ using React and Gemini AI
