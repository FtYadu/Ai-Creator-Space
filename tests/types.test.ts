import { describe, it, expect } from 'vitest';
import { Tool } from '../types';

describe('Types', () => {
  it('should have all required Tool enum values', () => {
    expect(Tool.DASHBOARD).toBe('DASHBOARD');
    expect(Tool.PROJECTS).toBe('PROJECTS');
    expect(Tool.IMAGE_GEN).toBe('IMAGE_GEN');
    expect(Tool.IMAGE_EDIT).toBe('IMAGE_EDIT');
    expect(Tool.IMAGE_ANALYZE).toBe('IMAGE_ANALYZE');
    expect(Tool.VIDEO_GEN).toBe('VIDEO_GEN');
    expect(Tool.VIDEO_ANALYZE).toBe('VIDEO_ANALYZE');
    expect(Tool.VOICE_ASSISTANT).toBe('VOICE_ASSISTANT');
    expect(Tool.TTS).toBe('TTS');
    expect(Tool.CHAT).toBe('CHAT');
  });
});
