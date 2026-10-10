import { describe, it, expect } from 'vitest';
import { parseYouTubeUrl, ytThumb, ytWatchUrl, isValidVideoId } from './youtube';

describe('YouTube URL parser', () => {
  it('parses bare 11-char video ID', () => {
    const res = parseYouTubeUrl('dQw4w9WgXcQ');
    expect(res).toEqual({ ok: true, id: 'dQw4w9WgXcQ' });
  });

  it('parses standard youtube watch URLs', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(res).toEqual({ ok: true, id: 'dQw4w9WgXcQ' });
  });

  it('parses short youtu.be URLs', () => {
    const res = parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(res).toEqual({ ok: true, id: 'dQw4w9WgXcQ' });
  });

  it('parses youtube live stream URLs', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/live/dQw4w9WgXcQ?feature=share');
    expect(res).toEqual({ ok: true, id: 'dQw4w9WgXcQ' });
  });

  it('parses youtube shorts URLs', () => {
    const res = parseYouTubeUrl('https://youtube.com/shorts/dQw4w9WgXcQ');
    expect(res).toEqual({ ok: true, id: 'dQw4w9WgXcQ' });
  });

  it('rejects unsupported domains to prevent arbitrary redirects', () => {
    const res = parseYouTubeUrl('https://evil-site.com/watch?v=dQw4w9WgXcQ');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('unsupported_host');
  });

  it('rejects empty and malformed input', () => {
    expect(parseYouTubeUrl('').ok).toBe(false);
    expect(parseYouTubeUrl('not a url').ok).toBe(false);
  });

  it('formats thumbnail and watch URLs accurately', () => {
    expect(ytThumb('dQw4w9WgXcQ')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    expect(ytWatchUrl('dQw4w9WgXcQ')).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(isValidVideoId('dQw4w9WgXcQ')).toBe(true);
    expect(isValidVideoId('too_short')).toBe(false);
  });
});
