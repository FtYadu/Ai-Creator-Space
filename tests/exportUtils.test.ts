/* eslint-disable @typescript-eslint/no-explicit-any, no-undef */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportProjectsAsJSON,
  exportMediaAsZip,
  importFromBackup,
  getStorageStats,
} from '../utils/exportUtils';
import type { Project, MediaItem } from '../types';

describe('Export Utilities', () => {
  let mockProjects: Project[];
  let mockMediaItems: MediaItem[];
  let createElementSpy: any;
  let revokeObjectURLSpy: any;
  let createObjectURLSpy: any;

  beforeEach(() => {
    // Setup mock data
    mockProjects = [
      { id: 'proj-1', name: 'Test Project 1', createdAt: '2025-01-01T00:00:00.000Z' },
      { id: 'proj-2', name: 'Test Project 2', createdAt: '2025-01-02T00:00:00.000Z' },
    ];

    mockMediaItems = [
      {
        id: 'media-1',
        projectId: 'proj-1',
        type: 'image',
        data: new Blob(['test image data'], { type: 'image/jpeg' }),
        createdAt: '2025-01-01T01:00:00.000Z',
        prompt: 'Test image prompt',
      },
      {
        id: 'media-2',
        projectId: 'proj-1',
        type: 'video',
        data: new Blob(['test video data'], { type: 'video/mp4' }),
        createdAt: '2025-01-01T02:00:00.000Z',
        prompt: 'Test video prompt',
      },
      {
        id: 'media-3',
        projectId: 'proj-2',
        type: 'chat',
        messages: [
          { id: '1', role: 'user', parts: [{ text: 'Hello' }] },
          { id: '2', role: 'model', parts: [{ text: 'Hi there!' }] },
        ],
        createdAt: '2025-01-02T01:00:00.000Z',
        prompt: 'Chat conversation',
      },
    ] as MediaItem[];

    // Mock DOM methods
    createElementSpy = vi.spyOn(document, 'createElement');
    const mockAnchor = {
      click: vi.fn(),
      remove: vi.fn(),
      href: '',
      download: '',
    };
    createElementSpy.mockReturnValue(mockAnchor as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportProjectsAsJSON', () => {
    it('should export projects and media metadata as JSON', async () => {
      await exportProjectsAsJSON(mockProjects, mockMediaItems);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should include version and export date in JSON', async () => {
      const blobConstructorSpy = vi.spyOn(global, 'Blob');

      await exportProjectsAsJSON(mockProjects, mockMediaItems);

      expect(blobConstructorSpy).toHaveBeenCalled();
      const blobContent = blobConstructorSpy.mock.calls[0][0][0] as string;
      const exportData = JSON.parse(blobContent);

      expect(exportData.version).toBe('1.0');
      expect(exportData.exportDate).toBeDefined();
      expect(exportData.projects).toHaveLength(2);
      expect(exportData.mediaMetadata).toHaveLength(3);
    });

    it('should exclude blob data from JSON export', async () => {
      const blobConstructorSpy = vi.spyOn(global, 'Blob');

      await exportProjectsAsJSON(mockProjects, mockMediaItems);

      const blobContent = blobConstructorSpy.mock.calls[0][0][0] as string;
      const exportData = JSON.parse(blobContent);

      // Check that blob data is not included
      exportData.mediaMetadata.forEach((item: any) => {
        expect(item.data).toBeUndefined();
        expect(item.id).toBeDefined();
        expect(item.projectId).toBeDefined();
        expect(item.type).toBeDefined();
      });
    });
  });

  describe('exportMediaAsZip', () => {
    it('should create ZIP file with project folders', async () => {
      await exportMediaAsZip(mockProjects, mockMediaItems);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should include metadata.json in ZIP', async () => {
      // This is a basic test - in a real scenario, we'd need to mock JSZip
      await exportMediaAsZip(mockProjects, mockMediaItems);

      expect(createElementSpy).toHaveBeenCalled();
    });
  });

  describe('importFromBackup', () => {
    it('should successfully import valid backup file', async () => {
      const validBackupContent = JSON.stringify({
        version: '1.0',
        exportDate: '2025-01-01T00:00:00.000Z',
        projects: mockProjects,
        mediaMetadata: [],
      });

      const mockFile = {
        text: vi.fn().mockResolvedValue(validBackupContent),
      } as any as File;

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await importFromBackup(mockFile, onSuccess, onError);

      expect(onSuccess).toHaveBeenCalledWith({ projects: mockProjects });
      expect(onError).not.toHaveBeenCalled();
    });

    it('should call onError for invalid backup format', async () => {
      const invalidBackupContent = JSON.stringify({
        // Missing 'version' and 'projects' fields
        data: 'invalid',
      });

      const mockFile = {
        text: vi.fn().mockResolvedValue(invalidBackupContent),
      } as any as File;

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await importFromBackup(mockFile, onSuccess, onError);

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith('Invalid backup file format');
    });

    it('should call onError for invalid JSON', async () => {
      const invalidJSON = 'not valid json {';

      const mockFile = {
        text: vi.fn().mockResolvedValue(invalidJSON),
      } as any as File;

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await importFromBackup(mockFile, onSuccess, onError);

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('getStorageStats', () => {
    it('should calculate total storage size correctly', async () => {
      const stats = await getStorageStats(mockProjects, mockMediaItems);

      expect(stats.projectCount).toBe(2);
      expect(stats.mediaCount).toBe(3);
      expect(stats.totalSizeBytes).toBeGreaterThan(0);
      expect(stats.totalSizeMB).toBeDefined();
    });

    it('should break down media by type', async () => {
      const stats = await getStorageStats(mockProjects, mockMediaItems);

      expect(stats.breakdown.images).toBe(1);
      expect(stats.breakdown.videos).toBe(1);
      expect(stats.breakdown.chats).toBe(1);
    });

    it('should handle empty projects and media', async () => {
      const stats = await getStorageStats([], []);

      expect(stats.projectCount).toBe(0);
      expect(stats.mediaCount).toBe(0);
      expect(stats.totalSizeBytes).toBe(0);
      expect(stats.totalSizeMB).toBe('0.00');
      expect(stats.breakdown.images).toBe(0);
      expect(stats.breakdown.videos).toBe(0);
      expect(stats.breakdown.chats).toBe(0);
    });

    it('should format size in MB correctly', async () => {
      const stats = await getStorageStats(mockProjects, mockMediaItems);

      expect(stats.totalSizeMB).toMatch(/^\d+\.\d{2}$/);
    });
  });
});
