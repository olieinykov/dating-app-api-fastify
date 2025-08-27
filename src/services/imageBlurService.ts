import sharp from 'sharp';
import { supabase } from './supabase.js';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export async function createBlurredVersion(
  originalBuffer: Buffer,
  originalFileName: string,
  mimeType: string,
  blurStrength: number = 20
): Promise<{ fileName: string; url: string; size: number }> {
  try {
    let imageBuffer: Buffer;

    if (mimeType.startsWith('video/')) {
      imageBuffer = await extractFrameFromVideo(originalBuffer);
    } else {
      imageBuffer = originalBuffer;
    }
    const blurredBuffer = await sharp(imageBuffer)
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

function extractFrameFromVideo(videoBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ffmpegPath = ffmpeg;

    const tempVideoPath = join(tmpdir(), `temp_video_${Date.now()}.mp4`);
    const tempFramePath = join(tmpdir(), `temp_frame_${Date.now()}.jpg`);

    try {
      writeFileSync(tempVideoPath, videoBuffer);

      const ffmpegProcess = spawn(ffmpegPath as string, [
        '-i',
        tempVideoPath,
        '-ss',
        '00:00:01',
        '-vframes',
        '1',
        '-f',
        'image2',
        tempFramePath,
      ]);

      ffmpegProcess.on('close', (code) => {
        try {
          if (code === 0) {
            const frameBuffer = readFileSync(tempFramePath);

            unlinkSync(tempVideoPath);
            unlinkSync(tempFramePath);

            resolve(frameBuffer);
          } else {
            try {
              unlinkSync(tempVideoPath);
              unlinkSync(tempFramePath);
            } catch (cleanupError) {
              console.error('Cleanup error:', cleanupError);
            }

            reject(new Error(`FFmpeg exited with code ${code}`));
          }
        } catch (readError) {
          reject(new Error(`Failed to read frame: ${readError}`));
        }
      });

      ffmpegProcess.on('error', (error) => {
        try {
          unlinkSync(tempVideoPath);
          unlinkSync(tempFramePath);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }

        reject(new Error(`FFmpeg process error: ${error.message}`));
      });

      ffmpegProcess.stderr.on('data', (data) => {
        console.log('FFmpeg stderr:', data.toString());
      });
    } catch (writeError) {
      reject(new Error(`Failed to write temp video file: ${writeError}`));
    }
  });
}
