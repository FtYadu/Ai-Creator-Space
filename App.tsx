

import React, { useState, useCallback, useRef, useEffect, FC } from 'react';
import { Tool, Settings, Theme, Project, MediaItem, DisplayMessage, MessagePart, MediaItemData, Notification } from './types';
import * as geminiService from './services/geminiService';
import { Chat, FunctionDeclaration, Type } from '@google/genai';
import type { LiveSession } from './services/geminiService';

// --- ICONS (Heroicons) ---
const HomeIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.69Z" /><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" /></svg>);
const SparklesIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.846.813l2.846-.813a.75.75 0 0 1 .976.976l-.813 2.846a3.75 3.75 0 0 0 .813 2.846l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-.813 2.846l.813 2.846a.75.75 0 0 1-.976.976l-2.846-.813a3.75 3.75 0 0 0-2.846.813l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.846-.813l-2.846.813a.75.75 0 0 1-.976-.976l.813-2.846a3.75 3.75 0 0 0-.813-2.846l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813a3.75 3.75 0 0 0 .813-2.846l-.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036a.75.75 0 0 0 1.036.258l1.036-.258a.75.75 0 0 1 .965.965l-.258 1.036a.75.75 0 0 0 .258 1.036l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258a.75.75 0 0 0-.258 1.036l.258 1.036a.75.75 0 0 1-.965.965l-1.036-.258a.75.75 0 0 0-1.036.258l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a.75.75 0 0 0-1.036-.258l-1.036.258a.75.75 0 0 1-.965-.965l.258-1.036a.75.75 0 0 0-.258-1.036l-1.036-.258a.75.75 0 0 1 0-1.456l1.036.258a.75.75 0 0 0 .258-1.036l-.258-1.036a.75.75 0 0 1 .965.965l1.036.258a.75.75 0 0 0 1.036.258l.258-1.036A.75.75 0 0 1 18 1.5ZM12 6a.75.75 0 0 1 .728.568l.258 1.036a.75.75 0 0 0 1.036.258l1.036-.258a.75.75 0 0 1 .965.965l-.258 1.036a.75.75 0 0 0 .258 1.036l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258a.75.75 0 0 0-.258 1.036l.258 1.036a.75.75 0 0 1-.965.965l-1.036-.258a.75.75 0 0 0-1.036.258l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a.75.75 0 0 0-1.036-.258l-1.036.258a.75.75 0 0 1-.965-.965l.258-1.036a.75.75 0 0 0-.258-1.036l-1.036-.258a.75.75 0 0 1 0-1.456l1.036.258a.75.75 0 0 0 .258-1.036l-.258-1.036a.75.75 0 0 1 .965.965l1.036.258a.75.75 0 0 0 1.036.258l.258-1.036A.75.75 0 0 1 12 6Z" clipRule="evenodd" /></svg>);
const PhotoIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25-2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06l2.755-2.755a.75.75 0 0 1 1.06 0l3.001 3.001a.75.75 0 0 0 1.06 0l1.53-1.531a.75.75 0 0 1 1.06 0l3.526 3.526a.75.75 0 0 0 1.06 0l2.365-2.365a.75.75 0 0 1 1.06 0V18a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75v-1.19Z" clipRule="evenodd" /></svg>);
const FilmIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-15ZM21 9a1.5 1.5 0 0 0-1.5-1.5H18a1.5 1.5 0 0 0-1.5 1.5v6.042a1.5 1.5 0 0 0 1.5 1.5h1.5a1.5 1.5 0 0 0 1.5-1.5V9ZM16.5 9a1.5 1.5 0 0 0-1.5-1.5H12a1.5 1.5 0 0 0-1.5 1.5v6.042a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5V9ZM9 9a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 9v6.042a1.5 1.5 0 0 0 1.5 1.5h1.5A1.5 1.5 0 0 0 9 15.042V9Z" /></svg>);
const PaintBrushIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M10.125 2.25a.75.75 0 0 1 .75.75v3.375a.75.75 0 0 1-1.5 0V3.75a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25V6.75a2.25 2.25 0 0 0 2.25 2.25h1.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V10.5a.75.75 0 0 0-.75-.75h-1.5a3.75 3.75 0 0 1-3.75-3.75V3.75a3.75 3.75 0 0 1 3.75-3.75h1.5a.75.75 0 0 1 .75.75Z" /><path d="M13.875 10.5a.75.75 0 0 1 .75-.75h1.5a3.75 3.75 0 0 1 3.75 3.75v3.375a3.75 3.75 0 0 1-3.75-3.75h-1.5a.75.75 0 0 1-.75-.75V10.5Z" /></svg>);
const EyeIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a.75.75 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" /></svg>);
const MicrophoneIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /><path d="M6 12.75A.75.75 0 0 1 5.25 12v-1.5a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 6 12.75ZM12 18.75a.75.75 0 0 1-.75-.75V16.5a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75ZM18 12.75a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75ZM12 12.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM15.75 12a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM12 15.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5Z" /><path fillRule="evenodd" d="M12 21a8.25 8.25 0 0 0 8.25-8.25.75.75 0 0 0-1.5 0A6.75 6.75 0 0 1 12 19.5a6.75 6.75 0 0 1-6.75-6.75.75.75 0 0 0-1.5 0A8.25 8.25 0 0 0 12 21Z" clipRule="evenodd" /></svg>);
const SpeakerWaveIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" /><path d="M15.932 7.757a.75.75 0 0 1 1.061 0 4.5 4.5 0 0 1 0 6.364.75.75 0 0 1-1.06-1.061 3 3 0 0 0 0-4.242.75.75 0 0 1 0-1.061Z" /></svg>);
const ChatBubbleLeftRightIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.75 6.75 0 0 0 6.75-6.75v-2.5a.75.75 0 0 1 1.5 0v2.5a8.25 8.25 0 0 1-8.25 8.25c-1.33 0-2.6-.363-3.718-1.002a.75.75 0 0 1 .52-1.352Z" clipRule="evenodd" /><path fillRule="evenodd" d="M12.75 3a8.25 8.25 0 0 0-8.25 8.25v2.5a.75.75 0 0 1-1.5 0v-2.5A9.75 9.75 0 0 1 12.75 1.5a9.75 9.75 0 0 1 9.75 9.75c0 4.96-3.73 9.073-8.544 9.685a.75.75 0 0 1-.686-1.425A8.25 8.25 0 0 0 21 11.25a8.25 8.25 0 0 0-8.25-8.25Z" clipRule="evenodd" /></svg>);
const FolderIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.5 21a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-5.25a3 3 0 0 1-2.65-1.5L9.75 1.5a3 3 0 0 0-2.65-1.5H4.5a3 3 0 0 0-3 3v15a3 3 0 0 0 3 3h15Z" /></svg>);
const ChevronLeftIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" /></svg>);
const Cog6ToothIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.542A12.035 12.035 0 0 0 9 5.625v2.053a.75.75 0 0 0 .75.75h3.5a.75.75 0 0 0 .75-.75V5.625a12.035 12.035 0 0 0-.228-1.833.75.75 0 0 0-1.5.066c.015.163.03.326.046.491V6.375a.75.75 0 0 1-.75.75h-2a.75.75 0 0 1-.75-.75V5.625a10.535 10.535 0 0 1 .25-1.654.75.75 0 0 0-1.138-.936A10.46 10.46 0 0 0 9 5.625v2.053a2.25 2.25 0 0 0 2.25 2.25h1.5a2.25 2.25 0 0 0 2.25-2.25V5.625a10.46 10.46 0 0 0-1.25-4.228.75.75 0 0 0-1.138.936c.198.323.37.669.52 1.026V6.375a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V5.625a10.535 10.535 0 0 1 .25-1.654A1.875 1.875 0 0 1 11.078 2.25ZM12.75 15a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75ZM12 18.75a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 0 1.5h-.008a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-1.5a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" /></svg>);
const UserCircleIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>);
const XMarkIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>);
const ArrowUpOnSquareIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V5.25A.75.75 0 0 1 9 4.5Zm3.75 3a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V7.5ZM12 3.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /><path d="M12 21a.75.75 0 0 0 .75-.75V18a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 0 .75.75Z" /><path fillRule="evenodd" d="M12 22.5c5.798 0 10.5-4.702 10.5-10.5S17.798 1.5 12 1.5 1.5 6.202 1.5 12 6.202 22.5 12 22.5ZM12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.75 9.75a.75.75 0 0 0-1.5 0V12a.75.75 0 0 0 1.5 0V9.75Z" clipRule="evenodd" /></svg>);
const SunIcon: FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.106a.75.75 0 0 1 0 1.06l-1.591 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.59a.75.75 0 0 1 1.06 0ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM17.894 17.894a.75.75 0 0 1-1.06 0l-1.59-1.591a.75.75 0 1 1 1.06-1.06l1.59 1.59a.75.75 0 0 1 0 1.06ZM12 18.75a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75ZM5.106 17.894a.75.75 0 0 1 0-1.06l1.59-1.591a.75.75 0 1 1 1.06 1.06l-1.59 1.59a.75.75 0 0 1-1.06 0ZM4.5 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75ZM6.106 5.106a.75.75 0 0 1 1.06 0l1.591 1.59a.75.75 0 0 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06Z" /></svg>;
const MoonIcon: FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.981A10.503 10.503 0 0 1 18 19.5a10.5 10.5 0 0 1-10.5-10.5c0-4.368 2.667-8.112 6.46-9.672a.75.75 0 0 1 .818.162Z" clipRule="evenodd" /></svg>;
const CloudArrowDownIcon: FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.5 3.75a2.25 2.25 0 0 0-2.25 2.25v.143c-.1.06-.2.124-.288.192A4.502 4.502 0 0 0 4.5 10.5v.75c0 1.954 1.226 3.64 2.943 4.256.12.03.243.056.368.078a.75.75 0 0 1 .53.738v.278a2.25 2.25 0 0 0 2.25 2.25h3a2.25 2.25 0 0 0 2.25-2.25v-.278a.75.75 0 0 1 .53-.738c.125-.022.248-.048.368-.078 1.717-.616 2.943-2.302 2.943-4.256v-.75a4.502 4.502 0 0 0-3.462-4.315c-.088-.068-.188-.132-.288-.192V6a2.25 2.25 0 0 0-2.25-2.25h-3ZM9 12.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm3-3.75a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3Zm3.75 3.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>;
const WrenchScrewdriverIcon: FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 0 1 5.25 5.25c0 2.12-1.29 3.94-3.141 4.795a.75.75 0 0 1-1.082-.544l-.24-1.202a3.75 3.75 0 0 0-5.152-2.148.75.75 0 0 1-.795-1.255 5.25 5.25 0 0 1 4.39-4.505c.205-.03.414-.044.624-.044Z" clipRule="evenodd" /><path d="m4.75 1.5.175.044a8.25 8.25 0 0 0 1.255.471l.248.093a.75.75 0 0 1 .496.865l-.33 1.652a.75.75 0 0 1-1.423-.284l.23-1.148a6.752 6.752 0 0 1-1.026-.384l-.248-.093a.75.75 0 0 1-.496-.865l.33-1.652a.75.75 0 0 1 .865-.496A.753.753 0 0 1 4.75 1.5Zm4.516 3.24a.75.75 0 0 1 .496.865l-.33 1.652a.75.75 0 0 1-1.423-.284l.23-1.148a6.752 6.752 0 0 1-1.026-.384l-.248-.093a.75.75 0 0 1-.496-.865l.33-1.652a.75.75 0 0 1 1.423.284l-.23 1.148c.36.136.707.29 1.04.458l.248.093a.75.75 0 0 1 .496.865ZM12 1.5a.75.75 0 0 1 .744.62c.162.612.285 1.233.366 1.858a.75.75 0 0 1-1.488.144c-.078-.59-.193-1.173-.346-1.74a.75.75 0 0 1 .724-.882Z" /><path fillRule="evenodd" d="M4.5 22.5a.75.75 0 0 1-.744-.62c-.162-.612-.285-1.233-.366-1.858a.75.75 0 0 1 1.488-.144c.078.59.193 1.173.346 1.74a.75.75 0 0 1-.724.882ZM11.66 18.265a.75.75 0 0 1 .53-1.282l1.246-.311a6.75 6.75 0 0 1 3.568-3.568l.311-1.246a.75.75 0 0 1 1.282-.53l1.589 1.589a.75.75 0 0 1-.53 1.282l-1.246.311a6.75 6.75 0 0 1-3.568 3.568l-.311 1.246a.75.75 0 0 1-1.282.53l-1.589-1.589Z" clipRule="evenodd" /></svg>;
const PlusCircleIcon: FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" /></svg>;
const BellIcon: FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 2.25c-2.429 0-4.82-1.33-7.297-3.988.226 2.384.98 4.673 2.185 6.673C10.03 10.233 12 12.29 12 15.625v.375a2.25 2.25 0 0 1-2.25 2.25H9a2.25 2.25 0 0 1-2.25-2.25v-.375c0-3.336-1.97-5.392-5.065-10.688 1.205-1.999 1.96-4.288 2.185-6.672C.18 3.07 0 5.994 0 9c0 5.523 4.477 10 10 10 1.344 0 2.63-.263 3.824-.75A8.22 8.22 0 0 1 12 19.5a8.22 8.22 0 0 1-1.824-.75.75.75 0 0 1-.368-1.045A.75.75 0 0 1 10.852 17a6.702 6.702 0 0 0 2.298.432 6.75 6.75 0 0 0 6.75-6.75c0-3.006-2.023-5.59-4.9-6.333a.75.75 0 0 1-.582-1.342 13.59 13.59 0 0 0 3.83-3.07C21 5.994 21 3.07 18.703-1.738 16.82-1.33 14.429 2.25 12 2.25Z" clipRule="evenodd" /></svg>;

const ALL_TOOLS = [
    { id: Tool.PROJECTS, name: 'Projects', Icon: FolderIcon, description: 'Organize your work and view your creations.' },
    { id: Tool.IMAGE_GEN, name: 'Generate Image', Icon: SparklesIcon, description: 'Create stunning visuals from text prompts using Imagen.' },
    { id: Tool.IMAGE_EDIT, name: 'Edit Image', Icon: PaintBrushIcon, description: 'Modify your images with intuitive text commands.' },
    { id: Tool.IMAGE_ANALYZE, name: 'Analyze Image', Icon: EyeIcon, description: 'Upload a photo and get detailed insights and analysis.' },
    { id: Tool.VIDEO_GEN, name: 'Generate Video', Icon: FilmIcon, description: 'Bring your ideas to life with text-to-video using Veo.' },
    { id: Tool.VIDEO_ANALYZE, name: 'Analyze Video', Icon: PhotoIcon, description: 'Extract key information and understand video content.' },
    { id: Tool.VOICE_ASSISTANT, name: 'Voice Assistant', Icon: MicrophoneIcon, description: 'Have a real-time voice conversation with Gemini.' },
    { id: Tool.TTS, name: 'Text to Speech', Icon: SpeakerWaveIcon, description: 'Generate natural-sounding speech from any text.' },
    { id: Tool.CHAT, name: 'Chat Assistant', Icon: ChatBubbleLeftRightIcon, description: 'Get help with tasks, from quick questions to complex problems.' },
];
const TOOL_MAP = new Map(ALL_TOOLS.map(t => [t.id, t]));

// --- FUNCTION CALLING SETUP ---
const GET_WEATHER_TOOL: FunctionDeclaration = {
    name: "get_current_weather",
    description: "Get the current weather in a given location",
    parameters: {
        type: Type.OBJECT,
        properties: {
            location: {
                type: Type.STRING,
                description: "The city and state, e.g. San Francisco, CA"
            },
        },
        required: ["location"]
    }
};
const TOOLS_CONFIG = [{ functionDeclarations: [GET_WEATHER_TOOL] }];

const availableTools = {
    get_current_weather: ({ location }: { location: string }) => {
        if (location.toLowerCase().includes("tokyo")) {
            return { weather: "sunny", temperature: "22°C" };
        } else if (location.toLowerCase().includes("london")) {
            return { weather: "rainy", temperature: "12°C" };
        }
        return { weather: "clear", temperature: "25°C" };
    }
};

// --- ACCESSIBILITY HOOK ---
const useFocusTrap = (ref: React.RefObject<HTMLElement>, isOpen: boolean) => {
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen && ref.current) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            const focusableElements = ref.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            firstElement?.focus();

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key !== 'Tab') return;
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            };

            const currentRef = ref.current;
            currentRef.addEventListener('keydown', handleKeyDown);
            return () => {
                currentRef.removeEventListener('keydown', handleKeyDown);
                previousFocusRef.current?.focus();
            };
        }
    }, [isOpen, ref]);
};


// --- SHARED COMPONENTS ---

const GlassContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, className, ...rest }, ref) => (
    <div ref={ref} {...rest} className={`bg-white/50 dark:bg-gray-800/20 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-lg transition-colors duration-300 ${className || ''}`}>
        {children}
    </div>
));

const Loader: FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <svg className="animate-spin h-10 w-10 text-purple-500 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-purple-600 dark:text-purple-300 font-medium">{message}</p>
    </div>
);

const Button = React.forwardRef<HTMLButtonElement, { onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode; className?: string; disabled?: boolean; variant?: 'primary' | 'secondary' }>(({ onClick, children, className, disabled, variant='primary' }, ref) => {
    const baseClasses = `px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`;
    const variantClasses = variant === 'primary' 
        ? 'text-white bg-purple-600 hover:bg-purple-700' 
        : 'text-purple-700 dark:text-purple-300 bg-purple-200/50 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/40';
    return <button ref={ref} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses} ${className}`}>{children}</button>;
});

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
            console.error("Invalid file type");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };
    const handleClick = () => inputRef.current?.click();

    return (
        <div 
            onClick={handleClick} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            className={`w-full cursor-pointer flex flex-col items-center justify-center p-6 bg-black/5 dark:bg-white/5 border-2 border-dashed rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 ${isDragging ? 'border-purple-500 bg-purple-500/20' : 'border-black/20 dark:border-white/20'}`}
        >
            <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={handleChange} />
            <PhotoIcon className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-2" />
            <span className="text-gray-600 dark:text-gray-300 text-center">{fileName || label}</span>
            <span className="text-xs text-gray-500 mt-1">or drag and drop</span>
            {uploadProgress != null && (
                 <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
            )}
        </div>
    );
};


// --- TOOL COMPONENTS ---
const AspectRatioSelector: FC<{ value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }> = ({ value, onChange, options }) => (
    <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">Aspect Ratio:</span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-gray-200/50 dark:bg-gray-700/50 border border-black/10 dark:border-white/10 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

interface ToolContentProps {
    addNotification: (message: string) => void;
    saveMediaItem: (item: MediaItemData, projectId: string) => void;
    projects: Project[];
    mediaItems: MediaItem[];
    addProject: (name: string) => void;
}

const ImageGenerator: FC<ToolContentProps> = ({ saveMediaItem, projects }) => {
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [creativity, setCreativity] = useState(0.8);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!prompt) { setError('Please enter a prompt.'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const image = await geminiService.generateImage(prompt, aspectRatio, negativePrompt, creativity);
            setResult(image);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const handleSave = async (projectId: string) => {
        if (!result) return;
        const blob = await geminiService.dataUrlToBlob(result);
        saveMediaItem({ type: 'image', data: blob, prompt }, projectId);
    };

    return (
        <div className="space-y-6">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A robot holding a red skateboard..." className="w-full h-24 p-3 bg-black/5 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <textarea value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="Negative prompt (e.g., blurry, text, watermark)" className="w-full h-16 p-3 bg-black/5 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            
            <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Creativity: <span className="font-mono">{creativity.toFixed(1)}</span></label>
                <input type="range" min="0" max="1" step="0.1" value={creativity} onChange={e => setCreativity(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            </div>

            <div className="flex justify-between items-center">
                <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} options={[{ value: '1:1', label: 'Square (1:1)' }, { value: '16:9', label: 'Widescreen (16:9)' }, { value: '9:16', label: 'Portrait (9:16)' }]} />
                <Button onClick={handleSubmit} disabled={loading}>Generate</Button>
            </div>
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            {loading && <Loader message="Generating your masterpiece..." />}
            {result && (
                <div className="space-y-4">
                    <img src={result} alt="Generated" className="rounded-lg w-full" />
                    <div className="flex gap-4">
                        <a href={result} download="generated-image.jpg" className="flex-1 text-center px-6 py-3 font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-all duration-300">Download</a>
                        <SaveToProjectModal projects={projects} onSave={handleSave} />
                    </div>
                </div>
            )}
        </div>
    );
};

const ImageEditor: FC<ToolContentProps> = ({ saveMediaItem, projects }) => {
    const [image, setImage] = useState<{ file: File; base64: string; preview: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    
    const handleFileUpload = async (file: File) => {
        setUploadProgress(0);
        const base64 = await geminiService.fileToBase64(file, setUploadProgress);
        setImage({ file, base64, preview: URL.createObjectURL(file) });
    };

    const handleSubmit = async () => {
        if (!prompt || !image) { setError('Please upload an image and enter a prompt.'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const editedImage = await geminiService.editImage(image.base64, image.file.type, prompt);
            setResult(editedImage);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };
    
    const handleSave = async (projectId: string) => {
        if (!result) return;
        const blob = await geminiService.dataUrlToBlob(result);
        saveMediaItem({ type: 'image', data: blob, prompt: `Edit: ${prompt}` }, projectId);
    };

    return (
        <div className="space-y-6">
            {!image && <FileUploader onFileUpload={handleFileUpload} accept="image/*" label="Upload an image to edit" uploadProgress={uploadProgress} />}
            {image && <img src={image.preview} className="rounded-lg max-w-sm mx-auto" />}
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Add a retro filter, make the sky blue..." className="w-full h-24 p-3 bg-black/5 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <div className="text-right"><Button onClick={handleSubmit} disabled={loading || !image}>Apply Edit</Button></div>
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            {loading && <Loader message="Applying your edits..." />}
            {result && (
                <div className="space-y-4">
                    <img src={result} alt="Edited" className="rounded-lg w-full" />
                    <div className="flex gap-4">
                        <a href={result} download="edited-image.jpg" className="flex-1 text-center px-6 py-3 font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-all duration-300">Download</a>
                        <SaveToProjectModal projects={projects} onSave={handleSave} />
                    </div>
                </div>
            )}
        </div>
    );
};

const ImageAnalyzer: FC<ToolContentProps> = ({}) => {
    const [image, setImage] = useState<{ file: File; base64: string; preview: string } | null>(null);
    const [prompt, setPrompt] = useState('Describe this image in detail.');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const handleFileUpload = async (file: File) => {
        setUploadProgress(0);
        const base64 = await geminiService.fileToBase64(file, setUploadProgress);
        setImage({ file, base64, preview: URL.createObjectURL(file) });
    };
    
    const handleSubmit = async () => {
        if (!image) { setError('Please upload an image.'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const analysis = await geminiService.generateContent([{ inlineData: { mimeType: image.file.type, data: image.base64 } }, prompt]);
            setResult(analysis);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            {!image && <FileUploader onFileUpload={handleFileUpload} accept="image/*" label="Upload an image to analyze" uploadProgress={uploadProgress} />}
            {image && <img src={image.preview} className="rounded-lg max-w-sm mx-auto" />}
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 p-3 bg-black/5 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <div className="text-right"><Button onClick={handleSubmit} disabled={loading || !image}>Analyze</Button></div>
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            {loading && <Loader message="Analyzing image..." />}
            {result && <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg whitespace-pre-wrap">{result}</div>}
        </div>
    );
};


const VideoGenerator: FC<ToolContentProps> = ({ saveMediaItem, projects, addNotification }) => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<{ file: File; base64: string; preview: string } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [result, setResult] = useState<{ objectUrl: string, blob: Blob } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [isApiKeySelected, setIsApiKeySelected] = useState(false);

    useEffect(() => {
        // @ts-ignore
        if (window.aistudio) {
            const checkKey = async () => {
                // @ts-ignore
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setIsApiKeySelected(hasKey);
            };
            checkKey();
        }
    }, []);

    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setIsApiKeySelected(true);
        }
    };

    const handleFileUpload = async (file: File) => {
        const base64 = await geminiService.fileToBase64(file, () => {});
        setImage({ file, base64, preview: URL.createObjectURL(file) });
    };

    const handleSubmit = async () => {
        if (!prompt) { setError('Please enter a prompt.'); return; }
        setLoading(true); setError(''); setResult(null); setProgress(0);
        try {
            const videoResult = await geminiService.generateVideo(
                prompt,
                image ? { base64: image.base64, mimeType: image.file.type } : null,
                aspectRatio,
                (message, p) => { setStatus(message); setProgress(p); }
            );
            setResult(videoResult);
            addNotification("Video generation complete!");
        } catch (err: any) {
            if (err.message?.includes('Requested entity was not found')) {
                setError('API key error. Please re-select your key.');
                setIsApiKeySelected(false);
            } else {
                setError(err.message); 
            }
        } finally { setLoading(false); }
    };

    const handleSave = (projectId: string) => {
        if (!result) return;
        saveMediaItem({ type: 'video', data: result.blob, prompt }, projectId);
    };

    if (!isApiKeySelected) {
        return (
            <div className="text-center p-8 space-y-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold">API Key Required for Video Generation</h3>
                <p className="max-w-md">Veo video generation requires you to select an API key associated with a project that has billing enabled.</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    For more information on billing, see the{' '}
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">
                        billing documentation
                    </a>.
                </p>
                <Button onClick={handleSelectKey}>Select API Key</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A neon hologram of a cat driving at top speed..." className="w-full h-24 p-3 bg-black/5 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <h4 className="font-semibold mb-2">Optional: Start image</h4>
                {!image && <FileUploader onFileUpload={handleFileUpload} accept="image/*" label="Upload a starting image" />}
                {image && <div className="relative w-24 h-24"><img src={image.preview} className="rounded-lg w-full h-full object-cover" /><button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><XMarkIcon className="w-4 h-4"/></button></div>}
            </div>

            <div className="flex justify-between items-center">
                <AspectRatioSelector value={aspectRatio} onChange={val => setAspectRatio(val as '16:9'|'9:16')} options={[{ value: '16:9', label: 'Landscape (16:9)' }, { value: '9:16', label: 'Portrait (9:16)' }]} />
                <Button onClick={handleSubmit} disabled={loading}>Generate Video</Button>
            </div>
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            {loading && <div className="space-y-2">
                <p className="text-purple-600 dark:text-purple-300 font-medium">{status}</p>
                <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5"><div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
            </div>}
            {result && (
                <div className="space-y-4">
                    <video src={result.objectUrl} controls className="rounded-lg w-full" />
                     <div className="flex gap-4">
                        <a href={result.objectUrl} download="generated-video.mp4" className="flex-1 text-center px-6 py-3 font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-all duration-300">Download</a>
                        <SaveToProjectModal projects={projects} onSave={handleSave} />
                    </div>
                </div>
            )}
        </div>
    );
};

const VideoAnalyzer: FC<ToolContentProps> = ({}) => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('Summarize this video. What are the key objects and actions?');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!videoFile) {
            setError("Please upload a video file.");
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const videoEl = document.createElement('video');
            videoEl.src = URL.createObjectURL(videoFile);
            
            const canvasEl = document.createElement('canvas');
            const context = canvasEl.getContext('2d');
            
            const frames: { inlineData: { mimeType: string; data: string } }[] = [];
            const captureFrames = (): Promise<void> => new Promise(resolve => {
                let framesCaptured = 0;
                const interval = videoEl.duration / 8; // capture 8 frames
                videoEl.onseeked = async () => {
                    if (framesCaptured >= 8 || !context) {
                        resolve();
                        return;
                    }
                    context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
                    const dataUrl = canvasEl.toDataURL('image/jpeg');
                    const base64 = dataUrl.split(',')[1];
                    frames.push({ inlineData: { mimeType: 'image/jpeg', data: base64 } });
                    framesCaptured++;
                    if (framesCaptured < 8) {
                        videoEl.currentTime += interval;
                    } else {
                        resolve();
                    }
                };
                videoEl.currentTime = 0;
            });

            videoEl.onloadedmetadata = () => {
                canvasEl.width = videoEl.videoWidth;
                canvasEl.height = videoEl.videoHeight;
                captureFrames().then(async () => {
                    URL.revokeObjectURL(videoEl.src);
                    const analysis = await geminiService.generateContent([prompt, ...frames]);
                    setResult(analysis);
                    setLoading(false);
                });
            };
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {!videoFile && <FileUploader onFileUpload={setVideoFile} accept="video/*" label="Upload a video to analyze"/>}
            {videoFile && <video src={URL.createObjectURL(videoFile)} controls className="rounded-lg max-w-sm mx-auto" />}
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 p-3 bg-black/5 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <div className="text-right"><Button onClick={handleSubmit} disabled={loading || !videoFile}>Analyze Video</Button></div>
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            {loading && <Loader message="Analyzing video frames..." />}
            {result && <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg whitespace-pre-wrap">{result}</div>}
        </div>
    );
};

const VoiceAssistant: FC<ToolContentProps> = ({}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState('');
    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const audioQueue = useRef<AudioBuffer[]>([]);
    const isPlaying = useRef(false);
    const nextStartTime = useRef(0);

    const playQueue = () => {
        if(isPlaying.current || audioQueue.current.length === 0) return;
        
        isPlaying.current = true;
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const source = audioCtx.createBufferSource();
        source.buffer = audioQueue.current.shift()!;
        source.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        if(now > nextStartTime.current) nextStartTime.current = now;
        
        source.start(nextStartTime.current);
        nextStartTime.current += source.buffer.duration;

        source.onended = () => {
            isPlaying.current = false;
            playQueue();
        };
    };
    
    const encodeAudio = (bytes: Uint8Array) => {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };


    const startSession = async () => {
        try {
            setError('');
            const sessionPromise = geminiService.startConversationSession(
                (text, isFinal, isModel) => setTranscription(prev => `${prev}\n${isModel ? 'AI' : 'You'}: ${text}${isFinal ? '\n' : ''}`),
                (audioBuffer) => { audioQueue.current.push(audioBuffer); playQueue(); },
                () => { audioQueue.current = []; nextStartTime.current = 0; },
                (name, args, id) => {
                    if (name in availableTools) {
                        const result = availableTools[name as keyof typeof availableTools](args);
                         sessionPromise.then(session => {
                            session.sendToolResponse({ functionResponses: { id, name, response: { result } } });
                        });
                        setTranscription(prev => `${prev}\nTool: Called ${name}, got ${JSON.stringify(result)}\n`);
                    }
                },
                TOOLS_CONFIG
            );
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) { int16[i] = inputData[i] * 32768; }
                const base64 = encodeAudio(new Uint8Array(int16.buffer));
                sessionPromise.then(session => {
                    session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
                });
            };

            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current.destination);
            
            sessionRef.current = await sessionPromise;
            setIsListening(true);
        } catch (err: any) {
            setError(err.message);
        }
    };
    
    const stopSession = () => {
        sessionRef.current?.close();
        mediaStreamSourceRef.current?.disconnect();
        scriptProcessorRef.current?.disconnect();
        audioContextRef.current?.close().catch(console.error);
        setIsListening(false);
    };
    
    useEffect(() => {
        return () => { // Cleanup on component unmount
            if(isListening) stopSession();
        }
    }, [isListening]);

    return (
        <div className="space-y-6">
            <Button onClick={isListening ? stopSession : startSession} className="w-full">{isListening ? 'Stop Listening' : 'Start Voice Assistant'}</Button>
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg h-64 overflow-y-auto whitespace-pre-wrap">{transcription || 'Transcription will appear here...'}</div>
        </div>
    );
};

const TextToSpeech: FC<ToolContentProps> = ({}) => {
    const [text, setText] = useState('Hello! I am a friendly AI assistant from Google.');
    const [voice, setVoice] = useState('Kore');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const audioRef = useRef<AudioBufferSourceNode | null>(null);
    
    const handleSubmit = async () => {
        if (!text) { setError('Please enter some text.'); return; }
        setLoading(true); setError('');
        try {
            if(audioRef.current) audioRef.current.stop();
            const audioBuffer = await geminiService.generateSpeech(text, voice);
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start();
            audioRef.current = source;
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <textarea value={text} onChange={e => setText(e.target.value)} className="w-full h-40 p-3 bg-black/5 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <div className="flex justify-between items-center">
                <select value={voice} onChange={e => setVoice(e.target.value)} className="bg-gray-200/50 dark:bg-gray-700/50 border border-black/10 dark:border-white/10 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500">
                    {['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Generating...' : 'Generate & Play'}</Button>
            </div>
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
        </div>
    );
};

const ChatAssistant: FC<ToolContentProps> = ({ saveMediaItem, projects }) => {
    const [mode, setMode] = useState<'quick' | 'complex'>('quick');
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [input, setInput] = useState('');
    const [image, setImage] = useState<{ file: File, preview: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages, loading]);

    const initializeChat = useCallback(() => {
        try {
            const model = mode === 'quick' ? 'gemini-flash-lite-latest' : 'gemini-2.5-pro';
            const tools = mode === 'complex' ? TOOLS_CONFIG : undefined;
            const instruction = mode === 'quick' 
                ? 'You are a helpful and friendly assistant. Keep your answers concise.' 
                : 'You are an expert assistant capable of deep analysis. Provide comprehensive and detailed answers. Use tools when necessary.';
            chatRef.current = geminiService.createChatSession(model, instruction, tools);
            setMessages([]); setError('');
        } catch (err: any) { setError(err.message); chatRef.current = null; }
    }, [mode]);

    useEffect(initializeChat, [initializeChat]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setImage({ file, preview: URL.createObjectURL(file) });
        }
    };
    
    const exportChat = () => {
        const markdown = messages.map(msg => {
            const role = msg.role === 'model' ? 'Assistant' : (msg.role === 'tool' ? 'Tool' : 'You');
            const parts = msg.parts.map(part => {
                if('text' in part) return part.text;
                if('inlineData' in part) return `[Image Uploaded]`;
                if('functionCall' in part) return `*Calling tool: ${part.functionCall.name}(${JSON.stringify(part.functionCall.args)})*`;
                if('functionResponse' in part) return `*Tool response: ${JSON.stringify(part.functionResponse.response)}*`;
                return '';
            }).join('\n');
            return `**${role}:**\n${parts}`;
        }).join('\n\n---\n\n');
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat-history.md';
        a.click();
        URL.revokeObjectURL(url);
    };


    const handleSubmit = async () => {
        if ((!input && !image) || loading) return;
        if (!chatRef.current) { initializeChat(); return; }
        
        setLoading(true); setError('');
        
        const userParts: MessagePart[] = [];
        if (image) {
            const base64 = await geminiService.fileToBase64(image.file, () => {});
            userParts.push({ inlineData: { mimeType: image.file.type, data: base64 }});
        }
        if (input) userParts.push({ text: input });

        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', parts: userParts }]);
        setInput(''); setImage(null);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: userParts });
            let currentModelMessage: DisplayMessage = { id: (Date.now() + 1).toString(), role: 'model', parts: [{ text: '' }] };
            let firstChunk = true;
            
            for await (const chunk of stream) {
                if (firstChunk) {
                     setMessages(prev => [...prev, currentModelMessage]);
                     firstChunk = false;
                }
                
                const currentTextPart = currentModelMessage.parts.find(p => 'text' in p) as { text: string };
                if (currentTextPart) {
                    currentTextPart.text += chunk.text;
                }
                
                const functionCalls = chunk.candidates?.[0]?.content?.parts.filter(p => p.functionCall);

                if (functionCalls && functionCalls.length > 0) {
                    currentModelMessage.parts.push(...functionCalls as MessagePart[]);
                }
                
                setMessages(prev => prev.map(m => m.id === currentModelMessage.id ? { ...currentModelMessage } : m));

            }

            const finalModelParts = currentModelMessage.parts.filter(p => 'functionCall' in p);
            if(finalModelParts.length > 0) {
                 for(const part of finalModelParts){
                     if('functionCall' in part){
                        const {name, args} = part.functionCall;
                        if(name in availableTools){
                            const result = availableTools[name as keyof typeof availableTools](args);
                            const toolResponseParts: MessagePart[] = [{ functionResponse: { name, response: {result} }}];
                            setMessages(prev => [...prev, {id: Date.now().toString(), role: 'tool', parts: toolResponseParts}]);
                            
                            const toolStream = await chatRef.current.sendMessageStream({message: toolResponseParts});
                            let toolModelMessage: DisplayMessage = { id: (Date.now() + 1).toString(), role: 'model', parts: [{text: ''}] };
                            let firstToolChunk = true;
                            for await(const chunk of toolStream) {
                                if(firstToolChunk) {
                                    setMessages(prev => [...prev, toolModelMessage]);
                                    firstToolChunk = false;
                                }
                                const currentToolTextPart = toolModelMessage.parts.find(p => 'text' in p) as {text: string};
                                if (currentToolTextPart) {
                                    currentToolTextPart.text += chunk.text;
                                }
                                setMessages(prev => prev.map(m => m.id === toolModelMessage.id ? {...toolModelMessage} : m));
                            }
                        }
                     }
                 }
            }

        } catch (err: any) { setError(err.message);
        } finally { setLoading(false); }
    };
    
    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-transparent">
            <div className="flex justify-between items-center p-2 border-b border-black/10 dark:border-white/10">
                 <div className="flex items-center gap-2">
                     <SaveToProjectModal projects={projects} onSave={(projectId) => saveMediaItem({ type: 'chat', messages }, projectId)} disabled={messages.length === 0} />
                     <Button onClick={exportChat} disabled={messages.length === 0} variant="secondary"><CloudArrowDownIcon className="w-5 h-5"/></Button>
                 </div>
                 <div className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 p-1 rounded-full">
                    <button onClick={() => setMode('quick')} className={`px-3 py-1 text-sm rounded-full ${mode === 'quick' ? 'bg-purple-600 text-white' : ''}`}>Quick</button>
                    <button onClick={() => setMode('complex')} className={`px-3 py-1 text-sm rounded-full ${mode === 'complex' ? 'bg-purple-600 text-white' : ''}`}>Complex</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                         <div className={`max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'}`}>
                            {msg.parts.map((part, i) => {
                                if ('text' in part) return <p key={i} className="whitespace-pre-wrap">{part.text}</p>;
                                if ('inlineData' in part) return <img key={i} src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} className="rounded-lg max-w-xs" />;
                                if ('functionCall' in part) return <div key={i} className="p-2 my-1 bg-gray-300 dark:bg-gray-600 rounded flex items-center gap-2 text-sm"><WrenchScrewdriverIcon className="w-4 h-4" /> Calling {part.functionCall.name}...</div>
                                return null;
                            })}
                        </div>
                    </div>
                ))}
                {loading && <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                        <div className="flex items-center space-x-1 h-5"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span></div>
                    </div>
                </div>}
                <div ref={messagesEndRef} />
            </div>
            {error && <p className="p-4 text-red-500 dark:text-red-400">{error}</p>}
            <div className="p-4 border-t border-black/10 dark:border-white/10">
                {image && <div className="relative w-24 h-24 mb-2"><img src={image.preview} className="rounded-lg w-full h-full object-cover" /><button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><XMarkIcon className="w-4 h-4"/></button></div>}
                <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg">
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-purple-500" aria-label="Upload Image"><PhotoIcon className="w-6 h-6"/></button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {if((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()}} placeholder="Ask anything, or upload an image..." className="w-full bg-transparent p-3 focus:outline-none" disabled={loading} />
                    <button onClick={handleSubmit} disabled={loading || (!input && !image)} className="p-3 text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 disabled:text-gray-500" aria-label="Send Message"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg></button>
                </div>
            </div>
        </div>
    );
};

const ToolView: FC<{ toolId: Tool, onBack: () => void } & ToolContentProps> = ({ toolId, onBack, ...props }) => {
    const tool = TOOL_MAP.get(toolId);
    if (!tool) return null;

    const renderTool = () => {
        switch (toolId) {
            case Tool.PROJECTS: return <ProjectsDashboard {...props} />;
            case Tool.IMAGE_GEN: return <ImageGenerator {...props} />;
            case Tool.IMAGE_EDIT: return <ImageEditor {...props} />;
            case Tool.IMAGE_ANALYZE: return <ImageAnalyzer {...props} />;
            case Tool.VIDEO_GEN: return <VideoGenerator {...props} />;
            case Tool.VIDEO_ANALYZE: return <VideoAnalyzer {...props} />;
            case Tool.VOICE_ASSISTANT: return <VoiceAssistant {...props} />;
            case Tool.TTS: return <TextToSpeech {...props} />;
            case Tool.CHAT: return <ChatAssistant {...props} />;
            default: return <div>Tool not implemented</div>;
        }
    };
    
    const isChat = toolId === Tool.CHAT || toolId === Tool.PROJECTS;

    return (
         <GlassContainer className={`w-full h-full ${isChat ? 'flex flex-col' : 'overflow-y-auto'}`}>
            <div className={`p-6 md:p-8 ${isChat ? '' : 'border-b-0'}`}>
                <div className="flex items-center mb-6">
                    <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors" aria-label="Go back to dashboard"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <div className="flex items-center space-x-3">
                        <tool.Icon className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                        <h2 className="text-2xl font-bold">{tool.name}</h2>
                    </div>
                </div>
                {!isChat && renderTool()}
            </div>
             {isChat && <div className="flex-1 min-h-0">{renderTool()}</div>}
        </GlassContainer>
    );
};

// --- MODALS & PANELS ---

const SettingsModal: FC<{ isOpen: boolean; onClose: () => void; settings: Settings; onSave: (newSettings: Settings) => void; }> = ({ isOpen, onClose, settings, onSave }) => {
    const [currentSettings, setCurrentSettings] = useState<Settings>(settings);
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef, isOpen);

    useEffect(() => { setCurrentSettings(settings); }, [settings, isOpen]);
    if (!isOpen) return null;

    const handleAvatarUpload = (file: File) => {
        geminiService.fileToBase64(file, () => {}).then(base64 => {
             setCurrentSettings(prev => ({...prev, userProfile: {...prev.userProfile, avatar: `data:${file.type};base64,${base64}` } }));
        });
    };
    
    const handleSave = () => { onSave(currentSettings); onClose(); };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <GlassContainer ref={modalRef} className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 id="settings-title" className="text-2xl font-bold">Settings</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Close settings"><XMarkIcon className="w-6 h-6" /></button>
                    </div>

                    <div className="space-y-6">
                         <div>
                            <h3 className="text-lg font-semibold mb-3">Appearance</h3>
                            <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                                <span>Theme</span>
                                <div className="flex items-center space-x-1 bg-black/5 dark:bg-white/5 p-1 rounded-full">
                                    <button onClick={() => setCurrentSettings(s => ({...s, theme: 'light'}))} className={`p-2 rounded-full ${currentSettings.theme === 'light' ? 'bg-purple-500 text-white' : ''}`} aria-label="Switch to light theme"><SunIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setCurrentSettings(s => ({...s, theme: 'dark'}))} className={`p-2 rounded-full ${currentSettings.theme === 'dark' ? 'bg-purple-500 text-white' : ''}`} aria-label="Switch to dark theme"><MoonIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Profile</h3>
                            <div className="flex items-center space-x-4">
                                <img src={currentSettings.userProfile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-gray-300 dark:bg-gray-700" />
                                <div className="space-y-2 flex-1">
                                    <input type="text" placeholder="Your Name" value={currentSettings.userProfile.name} onChange={(e) => setCurrentSettings(s => ({...s, userProfile: {...s.userProfile, name: e.target.value}}))} className="w-full p-2 bg-black/5 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    <label className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-all bg-purple-200/50 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/40"><ArrowUpOnSquareIcon className="w-4 h-4" /><input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])} /> Upload Avatar</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end"><Button onClick={handleSave}>Save Settings</Button></div>
                </div>
            </GlassContainer>
        </div>
    );
};

const SaveToProjectModal: FC<{ projects: Project[], onSave: (projectId: string) => void, disabled?: boolean }> = ({ projects, onSave, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const openButtonRef = useRef<HTMLButtonElement>(null);
    useFocusTrap(modalRef, isOpen);

    useEffect(() => {
        if(projects.length > 0 && !selectedProject) setSelectedProject(projects[0].id)
    }, [projects, selectedProject, isOpen]);
    
    const handleOpen = () => { if (projects.length > 0) setIsOpen(true); };
    const handleClose = () => setIsOpen(false);

    if(projects.length === 0) return <Button onClick={() => {}} disabled variant="secondary">Save (No Projects)</Button>;

    const handleSave = () => { onSave(selectedProject); handleClose(); };

    return <>
        <Button ref={openButtonRef} onClick={handleOpen} disabled={disabled} variant="secondary">Save to Project</Button>
        {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="save-title">
            <GlassContainer ref={modalRef} onClick={e=>e.stopPropagation()} className="w-full max-w-sm p-6 space-y-4">
                <h3 id="save-title" className="font-bold text-lg">Save to Project</h3>
                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="w-full p-2 bg-black/5 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="flex justify-end gap-2">
                    <Button onClick={handleClose} variant="secondary">Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </GlassContainer>
        </div>}
    </>
};

const MediaDisplay: FC<{item: MediaItem}> = ({ item }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        if ((item.type === 'image' || item.type === 'video') && item.data instanceof Blob) {
            objectUrl = URL.createObjectURL(item.data);
            setUrl(objectUrl);
        }

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [item]);

    if (item.type === 'image' && url) return <img src={url} alt={item.prompt || 'Generated Image'} className="w-full h-full object-cover"/>
    if (item.type === 'video' && url) return <video src={url} controls className="w-full h-full object-cover"/>
    if (item.type === 'chat') return <div className="p-2 flex items-center justify-center h-full"><ChatBubbleLeftRightIcon className="w-1/2 h-1/2 mx-auto text-gray-400"/></div>

    return <div className="w-full h-full bg-black/10 dark:bg-white/10 animate-pulse"></div>;
}

const ProjectsDashboard: FC<ToolContentProps> = ({ projects, mediaItems, addProject }) => {
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [newProjectName, setNewProjectName] = useState("");

    useEffect(() => {
        if (!activeProjectId && projects.length > 0) {
            setActiveProjectId(projects[0].id);
        }
    }, [projects, activeProjectId]);

    const handleAddProject = () => {
        if(newProjectName.trim()) {
            addProject(newProjectName.trim());
            setNewProjectName("");
        }
    }
    
    const activeProjectMedia = mediaItems.filter(m => m.projectId === activeProjectId);

    return (
        <div className="flex h-full">
            <div className="w-full md:w-1/3 border-r border-black/10 dark:border-white/10 p-4 space-y-2 flex flex-col">
                <h3 className="font-bold text-lg mb-2">Projects</h3>
                <div className="flex-grow overflow-y-auto space-y-2">
                    {projects.map(p => <button key={p.id} onClick={() => setActiveProjectId(p.id)} className={`w-full text-left p-2 rounded-lg transition-colors ${activeProjectId === p.id ? 'bg-purple-500/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>{p.name}</button>)}
                </div>
                <div className="flex gap-2 mt-2">
                    <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') handleAddProject()}} placeholder="New Project Name" className="flex-grow p-2 bg-black/5 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"/>
                    <Button onClick={handleAddProject} className="p-2 h-10 w-10 !px-0 flex-shrink-0"><PlusCircleIcon className="w-6 h-6"/></Button>
                </div>
            </div>
            <div className="w-full md:w-2/3 p-4 overflow-y-auto">
                <h3 className="font-bold text-lg mb-4">{projects.find(p=>p.id===activeProjectId)?.name || 'Select a Project'}</h3>
                {activeProjectId ? (
                    activeProjectMedia.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {activeProjectMedia.map(item => (
                                <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 shadow-inner">
                                    <MediaDisplay item={item} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 mt-4">No media in this project yet. Go create something!</p>
                    )
                ) : (
                     <p className="text-gray-500 dark:text-gray-400 mt-4">Create or select a project to view media.</p>
                )}
            </div>
        </div>
    )
};


const NotificationPanel: FC<{
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAllRead: () => void;
    onClearAll: () => void;
    triggerRef: React.RefObject<HTMLButtonElement>;
}> = ({ isOpen, onClose, notifications, onMarkAllRead, onClearAll, triggerRef }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    useFocusTrap(panelRef, isOpen);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if(isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    
    if(!isOpen) return null;

    return (
        <div ref={panelRef} className="fixed top-20 left-4 md:left-72 z-50">
             <GlassContainer className="w-80 max-h-[400px] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
                    <h3 className="font-bold">Notifications</h3>
                    <button onClick={onClose} aria-label="Close notifications" className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><XMarkIcon className="w-5 h-5"/></button>
                </div>
                {notifications.length > 0 ? (
                    <>
                        <div className="flex-grow overflow-y-auto p-2 space-y-1">
                            {notifications.map(n => (
                                <div key={n.id} className={`p-2 rounded-lg ${!n.read ? 'bg-purple-500/10' : ''}`}>
                                    <p className="text-sm">{n.message}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-2 border-t border-black/10 dark:border-white/10 flex justify-between">
                            <button onClick={onMarkAllRead} className="text-sm text-purple-500 hover:underline">Mark all as read</button>
                            <button onClick={onClearAll} className="text-sm text-red-500 hover:underline">Clear all</button>
                        </div>
                    </>
                ) : (
                    <p className="p-8 text-center text-gray-500">No notifications yet.</p>
                )}
            </GlassContainer>
        </div>
    );
};


// --- MAIN APP ---
const DEFAULT_SETTINGS: Settings = { userProfile: { name: 'Creator', avatar: '' }, apiConfigs: {}, theme: 'dark' };
const DEFAULT_TOOL_ORDER = ALL_TOOLS.map(t => t.id);

const App: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [projects, setProjects] = useState<Project[]>([]);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toolOrder, setToolOrder] = useState<Tool[]>(DEFAULT_TOOL_ORDER);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const notificationButtonRef = useRef<HTMLButtonElement>(null);
    const settingsButtonRef = useRef<HTMLButtonElement>(null);

     useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const storedSettings = localStorage.getItem('creatorSpaceSettings');
                if (storedSettings) setSettings(JSON.parse(storedSettings));
                else localStorage.setItem('creatorSpaceSettings', JSON.stringify(DEFAULT_SETTINGS));
                
                const storedToolOrder = localStorage.getItem('creatorSpaceToolOrder');
                if(storedToolOrder) setToolOrder(JSON.parse(storedToolOrder));

                const storedNotifications = localStorage.getItem('creatorSpaceNotifications');
                if(storedNotifications) setNotifications(JSON.parse(storedNotifications));

                const dbProjects = await geminiService.db.getAll<Project>('projects');
                if (dbProjects.length > 0) {
                    setProjects(dbProjects);
                } else {
                    const defaultProject: Project = {id: 'proj-1', name: 'My First Project', createdAt: new Date().toISOString()};
                    await geminiService.db.add('projects', defaultProject);
                    setProjects([defaultProject]);
                }
                
                const dbMedia = await geminiService.db.getAll<MediaItem>('mediaItems');
                setMediaItems(dbMedia);

            } catch (error) { console.error("Failed to load data:", error); }
            finally { setIsLoading(false); }
        };
        loadData();
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', settings.theme === 'dark');
        document.body.className = settings.theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white font-sans antialiased' 
            : 'bg-gray-100 text-gray-900 font-sans antialiased';
    }, [settings.theme]);
    
    const handleSaveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        localStorage.setItem('creatorSpaceSettings', JSON.stringify(newSettings));
    };

    const persistNotifications = (newNotifications: Notification[]) => {
        setNotifications(newNotifications);
        localStorage.setItem('creatorSpaceNotifications', JSON.stringify(newNotifications));
    }
    
    const addNotification = (message: string) => {
        const newNotification: Notification = {
            id: Date.now(),
            message,
            timestamp: new Date().toISOString(),
            read: false,
        };
        persistNotifications([newNotification, ...notifications]);
    };

    const addProject = async (name: string) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name,
            createdAt: new Date().toISOString()
        };
        await geminiService.db.add('projects', newProject);
        setProjects(prev => [...prev, newProject]);
    };

    const saveMediaItem = async (itemData: MediaItemData, projectId: string) => {
        const newItem: MediaItem = {
            ...itemData,
            id: `media-${Date.now()}`,
            projectId,
            createdAt: new Date().toISOString(),
        } as MediaItem;
        
        await geminiService.db.add('mediaItems', newItem);
        setMediaItems(prev => [...prev, newItem]);
        addNotification(`${itemData.type.charAt(0).toUpperCase() + itemData.type.slice(1)} saved to project.`);
    };

    const [draggedTool, setDraggedTool] = useState<Tool | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, toolId: Tool) => {
        setDraggedTool(toolId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetToolId: Tool) => {
        e.preventDefault();
        if (draggedTool === null || draggedTool === targetToolId) return;

        const newOrder = [...toolOrder];
        const draggedIndex = newOrder.indexOf(draggedTool);
        const targetIndex = newOrder.indexOf(targetToolId);

        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedTool);
        
        setToolOrder(newOrder);
        localStorage.setItem('creatorSpaceToolOrder', JSON.stringify(newOrder));
        setDraggedTool(null);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Loader message="Loading Creator Space..."/></div>;
    }

    const orderedTools = toolOrder.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean) as (typeof ALL_TOOLS)[0][];

    return (
        <>
            <div className={`min-h-screen p-4 md:p-8 flex flex-col md:flex-row gap-8 transition-colors duration-300`}>
                <aside className="w-full md:w-64 flex-shrink-0">
                    <GlassContainer className="p-4 h-full flex flex-col">
                         <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-4 mb-4">
                            {settings.userProfile.avatar ? <img src={settings.userProfile.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover" /> : <UserCircleIcon className="w-12 h-12 text-gray-500" />}
                            <div>
                                <h1 className="text-lg font-bold leading-tight">{settings.userProfile.name}</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Creator Space</p>
                            </div>
                        </div>

                        <nav className="space-y-2 flex-grow">
                            <button onClick={()=>setActiveTool(null)} className={`w-full flex items-center p-3 rounded-lg transition-colors ${!activeTool ? 'bg-purple-500/30' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}><HomeIcon className="w-5 h-5 mr-3" /> Dashboard</button>
                            {orderedTools.map(tool => <button key={tool.id} onClick={() => setActiveTool(tool.id)} className={`w-full flex items-center p-3 rounded-lg transition-colors text-left ${activeTool === tool.id ? 'bg-purple-500/30' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}><tool.Icon className="w-5 h-5 mr-3" /> {tool.name}</button>)}
                        </nav>
                        
                         <div className="border-t border-black/10 dark:border-white/10 pt-2 mt-2 space-y-1">
                             <button ref={notificationButtonRef} onClick={() => setIsNotificationPanelOpen(o => !o)} className="w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10" aria-label={`Notifications (${unreadCount} unread)`}>
                                <div className="flex items-center"><BellIcon className="w-5 h-5 mr-3" /> Notifications</div>
                                {unreadCount > 0 && <span className="bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount}</span>}
                            </button>
                             <button ref={settingsButtonRef} onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center p-3 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"><Cog6ToothIcon className="w-5 h-5 mr-3" /> Settings</button>
                        </div>

                    </GlassContainer>
                </aside>

                <main className="flex-1 min-w-0">
                    {activeTool ? (
                        <ToolView toolId={activeTool} onBack={() => setActiveTool(null)} addNotification={addNotification} saveMediaItem={saveMediaItem} projects={projects} mediaItems={mediaItems} addProject={addProject}/>
                    ) : (
                        <div className="h-full">
                             <GlassContainer className="p-6 h-full overflow-y-auto">
                                <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {orderedTools.map(tool => (
                                        <div key={tool.id} draggable="true" onDragStart={e => handleDragStart(e, tool.id)} onDragOver={handleDragOver} onDrop={e => handleDrop(e, tool.id)} className={`transition-opacity ${draggedTool === tool.id ? 'opacity-50' : 'opacity-100'}`}>
                                            <button onClick={() => setActiveTool(tool.id)} className="text-left w-full h-full">
                                                <GlassContainer className="p-6 h-full hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                                                    <div className="flex items-center space-x-4 mb-3"><tool.Icon className="w-8 h-8 text-purple-500 dark:text-purple-400" /><h3 className="text-xl font-semibold">{tool.name}</h3></div>
                                                    <p className="text-gray-600 dark:text-gray-300">{tool.description}</p>
                                                </GlassContainer>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </GlassContainer>
                        </div>
                    )}
                </main>
            </div>
            <NotificationPanel 
                isOpen={isNotificationPanelOpen} 
                onClose={() => setIsNotificationPanelOpen(false)} 
                notifications={notifications} 
                onMarkAllRead={() => persistNotifications(notifications.map(n => ({...n, read: true})))}
                onClearAll={() => persistNotifications([])}
                triggerRef={notificationButtonRef}
            />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={handleSaveSettings} />
        </>
    );
};

export default App;
