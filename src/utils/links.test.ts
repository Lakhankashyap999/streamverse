import { describe, it, expect } from 'vitest';
import { safeExternalUrl, safeImageSrc, SOCIAL_HOSTS } from './links';

describe('Link security and sanitization', () => {
  it('enforces https protocol', () => {
    expect(safeExternalUrl('http://youtube.com/@khusiytlive')).toBeNull();
    expect(safeExternalUrl('https://youtube.com/@khusiytlive')).toBe('https://youtube.com/@khusiytlive');
  });

  it('rejects embedded credentials to prevent phishing spoofing', () => {
    expect(safeExternalUrl('https://admin:pass@youtube.com/')).toBeNull();
  });

  it('validates against specific domain allow-lists', () => {
    expect(safeExternalUrl('https://instagram.com/igkhusi', [...SOCIAL_HOSTS.instagram])).toBe(
      'https://instagram.com/igkhusi',
    );
    expect(safeExternalUrl('https://malicious.com/igkhusi', [...SOCIAL_HOSTS.instagram])).toBeNull();
  });

  it('allows safe local image asset paths and data URLs', () => {
    expect(safeImageSrc('/images/creator/channel-avatar.webp')).toBe('/images/creator/channel-avatar.webp');
    expect(safeImageSrc('data:image/webp;base64,AAAA')).toBe('data:image/webp;base64,AAAA');
    expect(safeImageSrc('javascript:alert(1)')).toBeNull();
  });
});
