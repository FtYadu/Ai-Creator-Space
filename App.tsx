
import React, { useState, useCallback, useRef, useEffect, FC } from 'react';
import { Tool } from './types';
import * as geminiService from './services/geminiService';
import { Blob as GenAiBlob, Chat } from '@google/genai';
// Fix: Import LiveSession from geminiService where it's correctly typed.
import type { LiveSession } from './services/geminiService';

// --- ICONS (Heroicons) ---
const HomeIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.69Z" /><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" /></svg>);
const SparklesIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.846.813l2.846-.813a.75.75 0 0 1 .976.976l-.813 2.846a3.75 3.75 0 0 0 .813 2.846l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-.813 2.846l.813 2.846a.75.75 0 0 1-.976.976l-2.846-.813a3.75 3.75 0 0 0-2.846.813l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.846-.813l-2.846.813a.75.75 0 0 1-.976-.976l.813-2.846a3.75 3.75 0 0 0-.813-2.846l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813a3.75 3.75 0 0 0 .813-2.846l-.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036a.75.75 0 0 0 1.036.258l1.036-.258a.75.75 0 0 1 .965.965l-.258 1.036a.75.75 0 0 0 .258 1.036l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258a.75.75 0 0 0-.258 1.036l.258 1.036a.75.75 0 0 1-.965.965l-1.036-.258a.75.75 0 0 0-1.036.258l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a.75.75 0 0 0-1.036-.258l-1.036.258a.75.75 0 0 1-.965-.965l.258-1.036a.75.75 0 0 0-.258-1.036l-1.036-.258a.75.75 0 0 1 0-1.456l1.036.258a.75.75 0 0 0 .258-1.036l-.258-1.036a.75.75 0 0 1 .965.965l1.036.258a.75.75 0 0 0 1.036-.258l.258-1.036A.75.75 0 0 1 18 1.5ZM12 6a.75.75 0 0 1 .728.568l.258 1.036a.75.75 0 0 0 1.036.258l1.036-.258a.75.75 0 0 1 .965.965l-.258 1.036a.75.75 0 0 0 .258 1.036l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258a.75.75 0 0 0-.258 1.036l.258 1.036a.75.75 0 0 1-.965.965l-1.036-.258a.75.75 0 0 0-1.036.258l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a.75.75 0 0 0-1.036-.258l-1.036.258a.75.75 0 0 1-.965-.965l.258-1.036a.75.75 0 0 0-.258-1.036l-1.036-.258a.75.75 0 0 1 0-1.456l1.036.258a.75.75 0 0 0 .258-1.036l-.258-1.036a.75.75 0 0 1 .965-.965l1.036.258a.75.75 0 0 0 1.036-.258l.258-1.036A.75.75 0 0 1 12 6Z" clipRule="evenodd" /></svg>);
const PhotoIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06l2.755-2.755a.75.75 0 0 1 1.06 0l3.001 3.001a.75.75 0 0 0 1.06 0l1.53-1.531a.75.75 0 0 1 1.06 0l3.526 3.526a.75.75 0 0 0 1.06 0l2.365-2.365a.75.75 0 0 1 1.06 0V18a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75v-1.19Z" clipRule="evenodd" /></svg>);
const FilmIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-15ZM21 9a1.5 1.5 0 0 0-1.5-1.5H18a1.5 1.5 0 0 0-1.5 1.5v6.042a1.5 1.5 0 0 0 1.5 1.5h1.5a1.5 1.5 0 0 0 1.5-1.5V9ZM16.5 9a1.5 1.5 0 0 0-1.5-1.5H12a1.5 1.5 0 0 0-1.5 1.5v6.042a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5V9ZM9 9a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 9v6.042a1.5 1.5 0 0 0 1.5 1.5h1.5A1.5 1.5 0 0 0 9 15.042V9Z" /></svg>);
const PaintBrushIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M10.125 2.25a.75.75 0 0 1 .75.75v3.375a.75.75 0 0 1-1.5 0V3.75a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25V6.75a2.25 2.25 0 0 0 2.25 2.25h1.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V10.5a.75.75 0 0 0-.75-.75h-1.5a3.75 3.75 0 0 1-3.75-3.75V3.75a3.75 3.75 0 0 1 3.75-3.75h1.5a.75.75 0 0 1 .75.75Z" /><path d="M13.875 10.5a.75.75 0 0 1 .75-.75h1.5a3.75 3.75 0 0 1 3.75 3.75v3.375a3.75 3.75 0 0 1-3.75 3.75h-1.5a.75.75 0 0 1-.75-.75V10.5Z" /></svg>);
const EyeIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a.75.75 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" /></svg>);
const MicrophoneIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /><path d="M6 12.75A.75.75 0 0 1 5.25 12v-1.5a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 6 12.75ZM12 18.75a.75.75 0 0 1-.75-.75V16.5a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75ZM18 12.75a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75ZM12 12.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM15.75 12a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM12 15.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5Z" /><path fillRule="evenodd" d="M12 21a8.25 8.25 0 0 0 8.25-8.25.75.75 0 0 0-1.5 0A6.75 6.75 0 0 1 12 19.5a6.75 6.75 0 0 1-6.75-6.75.75.75 0 0 0-1.5 0A8.25 8.25 0 0 0 12 21Z" clipRule="evenodd" /></svg>);
const SpeakerWaveIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" /><path d="M15.932 7.757a.75.75 0 0 1 1.061 0 4.5 4.5 0 0 1 0 6.364.75.75 0 0 1-1.06-1.061 3 3 0 0 0 0-4.242.75.75 0 0 1 0-1.061Z" /></svg>);
const ChatBubbleLeftRightIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.75 6.75 0 0 0 6.75-6.75v-2.5a.75.75 0 0 1 1.5 0v2.5a8.25 8.25 0 0 1-8.25 8.25c-1.33 0-2.6-.363-3.718-1.002a.75.75 0 0 1 .52-1.352Z" clipRule="evenodd" /><path fillRule="evenodd" d="M12.75 3a8.25 8.25 0 0 0-8.25 8.25v2.5a.75.75 0 0 1-1.5 0v-2.5A9.75 9.75 0 0 1 12.75 1.5a9.75 9.75 0 0 1 9.75 9.75c0 4.96-3.73 9.073-8.544 9.685a.75.75 0 0 1-.686-1.425A8.25 8.25 0 0 0 21 11.25a8.25 8.25 0 0 0-8.25-8.25Z" clipRule="evenodd" /></svg>);
const CpuChipIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M7.502 1.5h9.006a2.25 2.25 0 0 1 2.25 2.25v9.006a2.25 2.25 0 0 1-2.25 2.25H7.502a2.25 2.25 0 0 1-2.25-2.25V3.75a2.25 2.25 0 0 1 2.25-2.25ZM9.002 4.5a.75.75 0 0 0-.75.75v1.502a.75.75 0 0 0 1.5 0V5.25a.75.75 0 0 0-.75-.75Zm.75 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm-.75 2.25a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm2.25.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm2.25.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm.75-5.25a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0V9a.75.75 0 0 0-.75-.75Zm2.25.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm-.75 5.25a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" /><path d="M2.996 18.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.746a.75.75 0 0 1-.75-.75ZM18.75 2.996a.75.75 0 0 1 .75.75v16.5a.75.75 0 0 1-1.5 0V3.746a.75.75 0 0 1 .75-.75Z" /></svg>);
const ChevronLeftIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" /></svg>);

const TOOLS = [
    { id: Tool.IMAGE_GEN, name: 'Generate Image', Icon: SparklesIcon, description: 'Create stunning visuals from text prompts using Imagen 4.' },
    { id: Tool.IMAGE_EDIT, name: 'Edit Image', Icon: PaintBrushIcon, description: 'Modify your images with intuitive text commands.' },
    { id: Tool.IMAGE_ANALYZE, name: 'Analyze Image', Icon: EyeIcon, description: 'Upload a photo and get detailed insights and analysis.' },
    { id: Tool.VIDEO_GEN, name: 'Generate Video', Icon: FilmIcon, description: 'Bring your ideas to life with text-to-video using Veo.' },
    { id: Tool.VIDEO_ANALYZE, name: 'Analyze Video', Icon: PhotoIcon, description: 'Extract key information and understand video content.' },
    { id: Tool.VOICE_ASSISTANT, name: 'Voice Assistant', Icon: MicrophoneIcon, description: 'Have a real-time voice conversation with Gemini.' },
    { id: Tool.TTS, name: 'Text to Speech', Icon: SpeakerWaveIcon, description: 'Generate natural-sounding speech from any text.' },
    { id: Tool.CHAT, name: 'Chat Assistant', Icon: ChatBubbleLeftRightIcon, description: 'Get help with tasks, from quick questions to complex problems.' },
];

// --- SHARED COMPONENTS ---

const GlassContainer: FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-gray-800/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg ${className}`}>
        {children}
    </div>
);

const Loader: FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <svg className="animate-spin h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-purple-300 font-medium">{message}</p>
    </div>
);

const Button: FC<{ onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode; className?: string; disabled?: boolean }> = ({ onClick, children, className, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-6 py-3 font-semibold text-white rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 ${className}`}
    >
        {children}
    </button>
);

interface FileUploaderProps {
    onFileUpload: (file: File) => void;
    accept: string;
    label: string;
    uploadProgress?: number | null;
}
const FileUploader: FC<FileUploaderProps> = ({ onFileUpload, accept, label, uploadProgress }) => {
    const [fileName, setFileName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        const validTypes = accept.split(',').map(t => t.trim().replace('/*', ''));
        if (file && validTypes.some(type => file.type.startsWith(type))) {
            onFileUpload(file);
            setFileName(file.name);
        } else {
             // Optional: Show an error message for invalid file types
            console.error("Invalid file type");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    
    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div 
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full cursor-pointer flex flex-col items-center justify-center p-6 bg-white/5 border-2 border-dashed rounded-lg hover:bg-white/10 transition-all duration-300 ${isDragging ? 'border-purple-500 bg-purple-900/30' : 'border-white/20'}`}
        >
            <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={handleChange} />
            <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-gray-300 text-center">{fileName || label}</span>
            <span className="text-xs text-gray-500 mt-1">or drag and drop</span>
            {uploadProgress != null && (
                 <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
            )}
        </div>
    );
};


// --- TOOL COMPONENTS ---

const AspectRatioSelector: FC<{ value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }> = ({ value, onChange, options }) => (
    <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-300">Aspect Ratio:</span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-gray-700/50 border border-white/10 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const ImageGenerator: FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const image = await geminiService.generateImage(prompt, aspectRatio);
            setResult(image);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A robot holding a red skateboard..."
                className="w-full h-24 p-3 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-between items-center">
                <AspectRatioSelector 
                    value={aspectRatio} 
                    onChange={setAspectRatio}
                    options={[
                        { value: '1:1', label: 'Square (1:1)' },
                        { value: '16:9', label: 'Widescreen (16:9)' },
                        { value: '9:16', label: 'Portrait (9:16)' },
                        { value: '4:3', label: 'Landscape (4:3)' },
                        { value: '3:4', label: 'Tall (3:4)' },
                    ]}
                />
                <Button onClick={handleSubmit} disabled={loading}>Generate</Button>
            </div>
            {error && <p className="text-red-400">{error}</p>}
            {loading && <Loader message="Generating your masterpiece..." />}
            {result && (
                <div className="space-y-4">
                    <img src={result} alt="Generated" className="rounded-lg w-full" />
                     <a
                        href={result}
                        download="generated-image.jpg"
                        className="inline-block w-full text-center px-6 py-3 font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-all duration-300 ease-in-out"
                    >
                        Download Image
                    </a>
                </div>
            )}
        </div>
    );
};

const ImageEditor: FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const handleFileChange = (selectedFile: File) => {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setUploadProgress(null);
        setResult(null);
    };

    const handleSubmit = async () => {
        if (!file || !prompt) {
            setError('Please upload an image and enter an edit prompt.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        setUploadProgress(0);
        try {
            const base64 = await geminiService.fileToBase64(file, setUploadProgress);
            setUploadProgress(null);
            const image = await geminiService.editImage(base64, file.type, prompt);
            setResult(image);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setUploadProgress(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <FileUploader 
                        onFileUpload={handleFileChange} 
                        accept="image/*" 
                        label="Upload or Drop Image" 
                        uploadProgress={uploadProgress} 
                    />
                    {preview && <img src={preview} alt="Preview" className="rounded-lg w-full" />}
                </div>
                <div className="space-y-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Add a retro filter and a llama..."
                        className="w-full h-24 p-3 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Button onClick={handleSubmit} disabled={loading || !file} className="w-full">Edit Image</Button>
                </div>
            </div>
            {error && <p className="text-red-400">{error}</p>}
            {loading && uploadProgress === null && <Loader message="Applying your edits..." />}
            {result && <div className="mt-6"><h3 className="text-lg font-semibold mb-2">Result</h3><img src={result} alt="Edited" className="rounded-lg w-full" /></div>}
        </div>
    );
};

const ImageAnalyzer: FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const handleFileChange = (selectedFile: File) => {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setUploadProgress(null);
        setResult(null);
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Please upload an image.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        setUploadProgress(0);
        try {
            const base64 = await geminiService.fileToBase64(file, setUploadProgress);
            setUploadProgress(null);
            const analysis = await geminiService.analyzeContent([{ inlineData: { mimeType: file.type, data: base64 } }, 'Describe this image in detail.']);
            setResult(analysis);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setUploadProgress(null);
        }
    };

    return (
        <div className="space-y-6">
            <FileUploader 
                onFileUpload={handleFileChange} 
                accept="image/*" 
                label="Upload or Drop Image to Analyze"
                uploadProgress={uploadProgress}
            />
            <div className="flex justify-center">
                <Button onClick={handleSubmit} disabled={loading || !file}>Analyze Image</Button>
            </div>
            {error && <p className="text-red-400">{error}</p>}
            {loading && uploadProgress === null && <Loader message="Analyzing image..." />}
            {preview && <img src={preview} alt="Preview" className="rounded-lg w-full max-w-md mx-auto" />}
            {result && <div className="mt-6 bg-white/5 p-4 rounded-lg"><h3 className="text-lg font-semibold mb-2">Analysis</h3><p className="whitespace-pre-wrap">{result}</p></div>}
        </div>
    );
};

const VideoGenerator: FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const checkKey = async () => {
            if ((window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey()) {
                setApiKeySelected(true);
            }
        };
        checkKey();
    }, []);

    const handleSelectKey = async () => {
        await (window as any).aistudio.openSelectKey();
        setApiKeySelected(true); // Assume success to avoid race conditions
    };

    const handleSubmit = async () => {
        if (!prompt && !file) {
            setError('Please enter a prompt or upload a starting image.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        try {
            let imagePayload: { base64: string; mimeType: string } | null = null;
            if (file) {
                const base64 = await geminiService.fileToBase64(file, () => {});
                imagePayload = { base64, mimeType: file.type };
            }
            const videoUrl = await geminiService.generateVideo(prompt, imagePayload, aspectRatio, setLoadingMessage);
            setResult(videoUrl);
        } catch (err: any) {
             setError(err.message);
             if (err.message.includes('API key error')) {
                setApiKeySelected(false);
             }
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };

    if (!apiKeySelected) {
        return (
            <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">API Key Required for Veo</h3>
                <p>Video generation requires a Google AI Studio API key. Please select one to continue.</p>
                <p className="text-sm text-gray-400">For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline text-purple-400">billing documentation</a>.</p>
                <Button onClick={handleSelectKey}>Select API Key</Button>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A neon hologram of a cat driving at top speed..."
                className="w-full h-24 p-3 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <FileUploader onFileUpload={setFile} accept="image/*" label="Upload Starting Image (Optional)" />
             <div className="flex justify-between items-center">
                <AspectRatioSelector 
                    value={aspectRatio} 
                    onChange={setAspectRatio as (val:string) => void}
                    options={[
                        { value: '16:9', label: 'Landscape (16:9)' },
                        { value: '9:16', label: 'Portrait (9:16)' },
                    ]}
                />
                <Button onClick={handleSubmit} disabled={loading}>Generate Video</Button>
            </div>
            {error && <p className="text-red-400">{error}</p>}
            {loading && <Loader message={loadingMessage || "Starting..."} />}
            {result && <video src={result} controls className="rounded-lg w-full" />}
        </div>
    );
};

const VideoAnalyzer: FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const handleFileChange = (selectedFile: File) => {
        setFile(selectedFile);
        setResult(null);
        setError('');
    };

    const extractFrames = (videoFile: File): Promise<{ base64: string; mimeType: string }[]> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let frames: { base64: string; mimeType: string }[] = [];
            
            video.src = URL.createObjectURL(videoFile);
            video.muted = true;

            video.onloadedmetadata = () => {
                const duration = video.duration;
                const interval = duration / 10; // Extract 10 frames
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                let currentTime = 0;

                const captureFrame = () => {
                    if (currentTime > duration) {
                        resolve(frames);
                        return;
                    }
                    video.currentTime = currentTime;
                };

                video.onseeked = () => {
                    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
                    frames.push({ base64, mimeType: 'image/jpeg' });
                    setProgress(Math.round((frames.length / 10) * 100));
                    currentTime += interval;
                    if (frames.length < 10) {
                        captureFrame();
                    } else {
                        resolve(frames);
                    }
                };
                
                captureFrame();
            };
            video.onerror = (e) => reject("Error loading video file.");
        });
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Please upload a video.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        setProgress(0);
        try {
            const frames = await extractFrames(file);
            const parts = frames.map(f => ({ inlineData: { mimeType: f.mimeType, data: f.base64 } }));
            const analysis = await geminiService.analyzeContent(['Analyze this sequence of video frames and provide a summary of the events.', ...parts]);
            setResult(analysis);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <FileUploader onFileUpload={handleFileChange} accept="video/*" label="Upload Video to Analyze" />
            <div className="flex justify-center">
                <Button onClick={handleSubmit} disabled={loading || !file}>Analyze Video</Button>
            </div>
            {error && <p className="text-red-400">{error}</p>}
            {loading && 
                <div>
                    <Loader message="Analyzing..." />
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-center text-sm mt-1">{progress}% (extracting frames)</p>
                </div>
            }
            {result && <div className="mt-6 bg-white/5 p-4 rounded-lg"><h3 className="text-lg font-semibold mb-2">Analysis</h3><p className="whitespace-pre-wrap">{result}</p></div>}
        </div>
    );
};

const VoiceAssistant: FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState({ user: '', model: '' });
    const [history, setHistory] = useState<{ user: string; model: string }[]>([]);
    const [error, setError] = useState('');
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);

    const sessionRef = useRef<LiveSession | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioQueueRef = useRef<AudioBuffer[]>([]);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const encode = (bytes: Uint8Array) => {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    const processAudioQueue = useCallback(() => {
        if (audioQueueRef.current.length === 0 || !outputAudioContextRef.current) {
            setIsModelSpeaking(false);
            return;
        }
        setIsModelSpeaking(true);
        const ctx = outputAudioContextRef.current;
        const buffer = audioQueueRef.current.shift();
        if (!buffer) return;

        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += buffer.duration;
        sourcesRef.current.add(source);

        source.onended = () => {
            sourcesRef.current.delete(source);
            processAudioQueue();
        };
    }, [isModelSpeaking]);

    const startRecording = async () => {
        try {
            setError('');
            setTranscription({ user: '', model: '' });
            setHistory([]);
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const sessionPromise = geminiService.startConversationSession(
                (text, isFinal, isModel) => {
                    const key = isModel ? 'model' : 'user';
                    setTranscription(prev => ({...prev, [key]: text}));
                    if (isFinal) {
                        setHistory(prev => {
                            const last = prev[prev.length - 1];
                            if (last && !last.model && isModel) {
                                last.model = text;
                                return [...prev.slice(0, -1), last];
                            } else if (!isModel) {
                                return [...prev, {user: text, model: ''}];
                            }
                            return prev;
                        });
                        setTranscription(prev => ({...prev, [key]: ''}));
                    }
                },
                (audioBuffer) => {
                    audioQueueRef.current.push(audioBuffer);
                    if (!isModelSpeaking) {
                        processAudioQueue();
                    }
                },
                () => { // onInterrupted
                    audioQueueRef.current = [];
                    for (const source of sourcesRef.current.values()) {
                        source.stop();
                    }
                    sourcesRef.current.clear();
                    nextStartTimeRef.current = 0;
                }
            );
            
            sessionPromise.then(session => sessionRef.current = session);
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const context = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = context;
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                const b64 = encode(new Uint8Array(int16.buffer));
                const pcmBlob: GenAiBlob = { data: b64, mimeType: 'audio/pcm;rate=16000' };

                sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(processor);
            processor.connect(context.destination);
            setIsRecording(true);
        } catch (err) {
            setError('Could not start recording. Please allow microphone access.');
            console.error(err);
        }
    };
    
    const stopRecording = () => {
        sessionRef.current?.close();
        sessionRef.current = null;
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        audioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        scriptProcessorRef.current?.disconnect();
        setIsRecording(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-center">
                <Button onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? 'Stop Conversation' : 'Start Conversation'}
                </Button>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
            <div className="bg-white/5 p-4 rounded-lg min-h-[200px] space-y-4">
                 {history.map((turn, i) => (
                    <div key={i}>
                        <p><span className="font-bold text-purple-300">You: </span>{turn.user}</p>
                        <p><span className="font-bold text-green-300">Assistant: </span>{turn.model}</p>
                    </div>
                 ))}
                 {transcription.user && <p><span className="font-bold text-purple-300">You: </span>{transcription.user}</p>}
                 {transcription.model && <p><span className="font-bold text-green-300">Assistant: </span>{transcription.model}</p>}
                 {isModelSpeaking && <p className="text-sm text-gray-400 animate-pulse">Assistant is speaking...</p>}
            </div>
        </div>
    );
};

const TTS_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];
const TextToSpeech: FC = () => {
    const [text, setText] = useState('');
    const [voice, setVoice] = useState(TTS_VOICES[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleSubmit = async () => {
        if (!text) return;
        setLoading(true);
        setError('');
        try {
            const audioBuffer = await geminiService.generateSpeech(text, voice);
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                className="w-full h-32 p-3 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="flex items-center space-x-2">
                     <span className="text-sm text-gray-300">Voice:</span>
                     <select value={voice} onChange={(e) => setVoice(e.target.value)} className="bg-gray-700/50 border border-white/10 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500">
                        {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                 <Button onClick={handleSubmit} disabled={loading || !text}>
                    {loading ? 'Generating...' : 'Speak'}
                 </Button>
            </div>
            {error && <p className="text-red-400">{error}</p>}
        </div>
    );
};

const ChatAssistant: FC = () => {
    const [mode, setMode] = useState<'quick' | 'complex'>('quick');
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages, loading]);

    useEffect(() => {
        const model = mode === 'quick' ? 'gemini-flash-lite-latest' : 'gemini-2.5-pro';
        const instruction = mode === 'quick' 
            ? 'You are a helpful and friendly assistant. Keep your answers concise.' 
            : 'You are an expert assistant capable of deep analysis. Provide comprehensive and detailed answers.';
        chatRef.current = geminiService.createChatSession(model, instruction);
        setMessages([]);
    }, [mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input || loading || !chatRef.current) return;
        
        setLoading(true);
        setError('');
        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const stream = await chatRef.current.sendMessageStream({ message: input });
            let modelResponse = '';
            let firstChunk = true;
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                if (firstChunk) {
                    setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
                    firstChunk = false;
                } else {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'model') {
                            // Fix: Prevent state mutation by creating a new object for the last message.
                            newMessages[newMessages.length - 1] = { ...lastMessage, text: modelResponse };
                        }
                        return newMessages;
                    });
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-end p-2">
                <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-full">
                    <button onClick={() => setMode('quick')} className={`px-3 py-1 text-sm rounded-full ${mode === 'quick' ? 'bg-purple-600' : ''}`}>Quick</button>
                    <button onClick={() => setMode('complex')} className={`px-3 py-1 text-sm rounded-full ${mode === 'complex' ? 'bg-purple-600' : ''}`}>Complex</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                     <div className="flex justify-start">
                        <div className="p-3 rounded-2xl bg-gray-700 rounded-bl-none">
                             <div className="flex items-center space-x-1 h-5">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {error && <p className="p-4 text-red-400">{error}</p>}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
                <div className="flex items-center bg-white/5 rounded-lg">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === 'quick' ? "Ask a quick question..." : "Describe a complex problem..."}
                        className="w-full bg-transparent p-3 focus:outline-none"
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input} className="p-3 text-purple-400 hover:text-purple-300 disabled:text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

const ToolView: FC<{ toolId: Tool, onBack: () => void }> = ({ toolId, onBack }) => {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) return null;

    const renderTool = () => {
        switch (toolId) {
            case Tool.IMAGE_GEN: return <ImageGenerator />;
            case Tool.IMAGE_EDIT: return <ImageEditor />;
            case Tool.IMAGE_ANALYZE: return <ImageAnalyzer />;
            case Tool.VIDEO_GEN: return <VideoGenerator />;
            case Tool.VIDEO_ANALYZE: return <VideoAnalyzer />;
            case Tool.VOICE_ASSISTANT: return <VoiceAssistant />;
            case Tool.TTS: return <TextToSpeech />;
            case Tool.CHAT: return <ChatAssistant />;
            default: return null;
        }
    };
    
    const isChat = toolId === Tool.CHAT;

    return (
         <GlassContainer className={`w-full h-full ${isChat ? 'flex flex-col' : 'overflow-y-auto'}`}>
            <div className={`p-6 md:p-8 ${isChat ? 'border-b border-white/10' : ''}`}>
                <div className="flex items-center mb-6">
                    <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <tool.Icon className="w-8 h-8 text-purple-400" />
                        <h2 className="text-2xl font-bold">{tool.name}</h2>
                    </div>
                </div>
                {!isChat && renderTool()}
            </div>
             {isChat && <div className="flex-1 min-h-0">{renderTool()}</div>}
        </GlassContainer>
    );
};


// --- MAIN APP ---

const App: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);

    const handleSelectTool = (toolId: Tool) => {
        setActiveTool(toolId);
    };

    const handleBackToDashboard = () => {
        setActiveTool(null);
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 flex-shrink-0">
                <GlassContainer className="p-4 h-full">
                    <h1 className="text-2xl font-bold text-center mb-6 text-white">Creator Space</h1>
                    <nav className="space-y-2">
                        <button onClick={handleBackToDashboard} className={`w-full flex items-center p-3 rounded-lg transition-colors ${!activeTool ? 'bg-purple-500/30 text-white' : 'hover:bg-white/10 text-gray-300'}`}>
                           <HomeIcon className="w-5 h-5 mr-3" /> Dashboard
                        </button>
                        {TOOLS.map(tool => (
                             <button key={tool.id} onClick={() => handleSelectTool(tool.id)} className={`w-full flex items-center p-3 rounded-lg transition-colors text-left ${activeTool === tool.id ? 'bg-purple-500/30 text-white' : 'hover:bg-white/10 text-gray-300'}`}>
                                <tool.Icon className="w-5 h-5 mr-3" /> {tool.name}
                            </button>
                        ))}
                    </nav>
                </GlassContainer>
            </aside>

            <main className="flex-1 min-w-0">
                {activeTool ? (
                    <ToolView toolId={activeTool} onBack={handleBackToDashboard} />
                ) : (
                    <div className="h-full">
                         <GlassContainer className="p-6 h-full overflow-y-auto">
                            <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {TOOLS.map(tool => (
                                    <button key={tool.id} onClick={() => handleSelectTool(tool.id)} className="text-left">
                                        <GlassContainer className="p-6 h-full hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                                            <div className="flex items-center space-x-4 mb-3">
                                                <tool.Icon className="w-8 h-8 text-purple-400" />
                                                <h3 className="text-xl font-semibold text-white">{tool.name}</h3>
                                            </div>
                                            <p className="text-gray-300">{tool.description}</p>
                                        </GlassContainer>
                                    </button>
                                ))}
                            </div>
                        </GlassContainer>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
