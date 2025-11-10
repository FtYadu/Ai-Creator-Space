import JSZip from 'jszip';
import { Project, MediaItem } from '../types';

// Export projects and their metadata as JSON
export const exportProjectsAsJSON = async (projects: Project[], mediaItems: MediaItem[]) => {
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        projects,
        mediaMetadata: mediaItems.map(item => ({
            id: item.id,
            projectId: item.projectId,
            type: item.type,
            createdAt: item.createdAt,
            prompt: item.prompt,
            // Exclude blob data from JSON export
        })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `creator-space-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Export all media as a ZIP file
export const exportMediaAsZip = async (projects: Project[], mediaItems: MediaItem[]) => {
    const zip = new JSZip();

    // Create a folder for each project
    for (const project of projects) {
        const projectFolder = zip.folder(project.name);
        if (!projectFolder) continue;

        const projectMedia = mediaItems.filter(m => m.projectId === project.id);

        for (const item of projectMedia) {
            if (item.type === 'image' || item.type === 'video') {
                const extension = item.type === 'image' ? 'jpg' : 'mp4';
                const fileName = `${item.id.substring(0, 8)}-${item.createdAt.split('T')[0]}.${extension}`;
                projectFolder.file(fileName, item.data);
            } else if (item.type === 'chat') {
                const chatData = JSON.stringify(item.messages, null, 2);
                const fileName = `chat-${item.id.substring(0, 8)}-${item.createdAt.split('T')[0]}.json`;
                projectFolder.file(fileName, chatData);
            }
        }
    }

    // Add metadata file
    const metadata = {
        exportDate: new Date().toISOString(),
        totalProjects: projects.length,
        totalMedia: mediaItems.length,
        projects: projects.map(p => ({ id: p.id, name: p.name, createdAt: p.createdAt })),
    };
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `creator-space-media-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Import data from JSON backup
export const importFromBackup = async (
    file: File,
    onSuccess: (data: { projects: Project[] }) => void,
    onError: (error: string) => void
) => {
    try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate backup format
        if (!data.version || !data.projects) {
            throw new Error('Invalid backup file format');
        }

        onSuccess({ projects: data.projects });
    } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to import backup');
    }
};

// Get storage statistics
export const getStorageStats = async (projects: Project[], mediaItems: MediaItem[]) => {
    let totalSize = 0;

    for (const item of mediaItems) {
        if ((item.type === 'image' || item.type === 'video') && item.data instanceof Blob) {
            totalSize += item.data.size;
        }
    }

    return {
        projectCount: projects.length,
        mediaCount: mediaItems.length,
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        breakdown: {
            images: mediaItems.filter(m => m.type === 'image').length,
            videos: mediaItems.filter(m => m.type === 'video').length,
            chats: mediaItems.filter(m => m.type === 'chat').length,
        },
    };
};
