import sharp from 'sharp';
import { supabase } from './supabase.js';

export async function createBlurredVersion(
  originalBuffer: Buffer,
  originalFileName: string,
  blurStrength: number = 20
): Promise<{ fileName: string; url: string; size: number }> {
  try {
    const blurredBuffer = await sharp(originalBuffer)
      .blur(blurStrength)
      .jpeg({ quality: 80 })
      .toBuffer();

    const blurredFileName = `blurred_${originalFileName.replace(/\.[^/.]+$/, '')}.jpg`;

    const { error } = await supabase.storage
      .from('uploads')
      .upload(blurredFileName, blurredBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(blurredFileName);

    return {
      fileName: blurredFileName,
      url: urlData.publicUrl,
      size: blurredBuffer.length,
    };
  } catch (error) {
    throw new Error(`Error creating blur: ${error}`);
  }
}
