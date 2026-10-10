import { FriendlyError } from '../utils/misc';
import { logDev } from './crud';
import { supabase } from './supabaseClient';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_INPUT_BYTES = 8 * 1024 * 1024;

const LIMITS = {
  avatar: { maxW: 512, maxH: 512 },
  banner: { maxW: 1600, maxH: 600 },
} as const;

export type ImageKind = keyof typeof LIMITS;

/** Downscales + re-encodes to WebP in the browser before upload. */
async function optimise(file: File, kind: ImageKind): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const { maxW, maxH } = LIMITS[kind];
  const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/webp', 0.85),
  );
}

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(b);
  });

export const storageService = {
  validate(file: File): string | null {
    if (!ALLOWED.includes(file.type)) return 'Please choose a JPG, PNG or WebP image.';
    if (file.size > MAX_INPUT_BYTES) return 'Image is too large (max 8 MB).';
    return null;
  },

  /** Returns a public URL (Supabase Storage) or a data URL in demo mode. */
  async uploadImage(file: File, kind: ImageKind): Promise<string> {
    const invalid = storageService.validate(file);
    if (invalid) throw new FriendlyError(invalid);
    let blob: Blob;
    try {
      blob = await optimise(file, kind);
    } catch {
      throw new FriendlyError("We couldn't process that image. Try a different file.");
    }
    if (!supabase) return blobToDataUrl(blob);

    const path = `profile/${kind}-${Date.now()}.webp`;
    const { error } = await supabase.storage
      .from('media')
      .upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
    if (error) {
      logDev(error);
      throw new FriendlyError('Upload failed. Please try again.');
    }
    return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
  },
};
