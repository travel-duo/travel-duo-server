import * as path from 'path';
import { join } from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as ffmpeg from 'fluent-ffmpeg';
import { createReadStream, ReadStream } from 'fs';
import { createHash } from 'crypto';
import { v4 } from 'uuid';
import { PDFDocument } from 'pdf-lib';
import { fromBase64 } from 'pdf2pic';

export class MediaUtil {
  async saveTempFile(input: Express.Multer.File): Promise<string> {
    const uuid = v4();
    // with extension
    const tempPath = join(
      os.tmpdir(),
      `input_${uuid}.${input.originalname.split('.').pop()}`,
    );

    await fs.writeFile(tempPath, input.buffer);

    const fileHash = await this.generateHash(tempPath);
    const hashedPath = join(
      os.tmpdir(),
      `${fileHash}.${input.originalname.split('.').pop()}`,
    );
    await fs.rename(tempPath, hashedPath);

    return hashedPath;
  }

  async getDestination(path: string, filePath: string): Promise<string> {
    const hashedFile = await this.generateHash(filePath);
    return join(path, `${hashedFile}.${filePath.split('.').pop()}`);
  }

  async generateHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  async saveAudioFileFromVideoFile(
    filePath: string,
    noiseReduction: number = -25,
    silenceThreshold: number = -30,
    targetSampleRate: number = 16000,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        path.dirname(filePath),
        `${path.basename(filePath, path.extname(filePath))}.wav`,
      );

      ffmpeg(filePath)
        .audioCodec('pcm_s16le')
        .audioFilters([
          `afftdn=nf=${noiseReduction}:nt=w`, // Noise reduction
          `silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=${silenceThreshold}dB`, // Silence removal
          `aresample=${targetSampleRate}`, // Resampling
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async createReadStream(filePath: string): Promise<ReadStream> {
    return createReadStream(filePath);
  }

  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete temp file: ${filePath}`, error);
    }
  }

  async extractAudioSegment(
    inputPath: string,
    startTime: number,
    endTime: number,
    outputPath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(endTime - startTime)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        if (metadata && metadata.format && metadata.format.duration) {
          resolve(metadata.format.duration);
        } else {
          reject(new Error('Unable to determine audio duration'));
        }
      });
    });
  }

  async detectAllSilence(
    filePath: string,
    startTime: number,
    noise: number,
    duration: number,
  ): Promise<{ start: number; end: number }[]> {
    return new Promise((resolve, reject) => {
      let currentStart: number | null = null;
      const silenceData: { start: number; end: number }[] = [];
      const outputPath = path.join(os.tmpdir(), 'silence_output.txt');
      try {
        ffmpeg(filePath)
          .audioFilters(`silencedetect=noise=${noise}dB:d=${duration}`)
          .format('null')
          .output(outputPath)
          .on('stderr', (stderrLine) => {
            if (stderrLine.includes('silence_start')) {
              currentStart = parseFloat(stderrLine.split('silence_start:')[1]);
            } else if (
              stderrLine.includes('silence_end') &&
              currentStart !== null
            ) {
              const silenceEnd = parseFloat(
                stderrLine.split('silence_end:')[1],
              );
              if (currentStart >= startTime) {
                silenceData.push({ start: currentStart, end: silenceEnd });
              }
              currentStart = null;
            }
          })
          .on('error', (err) => {
            reject(err);
          })
          .on('end', () => {
            if (silenceData.length === 0) {
              resolve([]);
            } else {
              resolve(silenceData);
            }
          })
          .run();
      } finally {
        // this.cleanupTempFile(outputPath);
      }
    });
  }

  private parseSilenceOutput(
    output: string,
    startTime: number,
    endTime: number,
  ): Array<{ start: number; end: number }> {
    const lines = output.split('\n');
    const silences: Array<{ start: number; end: number }> = [];
    let currentStart: number | null = null;

    for (const line of lines) {
      if (line.includes('silence_start')) {
        currentStart = parseFloat(line.split('silence_start:')[1].trim());
      } else if (line.includes('silence_end') && currentStart !== null) {
        const silenceEnd = parseFloat(line.split('silence_end:')[1].trim());
        if (currentStart >= startTime && silenceEnd <= endTime) {
          silences.push({ start: currentStart, end: silenceEnd });
        }
        currentStart = null;
      }
    }

    return silences;
  }

  async getImagesFromPdf(filePath: string): Promise<string[]> {
    const pdfBuffer = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    const result: string[] = [];

    const savePath = path.join(path.dirname(filePath), 'pdf_images');
    await fs.mkdir(savePath, { recursive: true });

    const options = {
      density: 100,
      saveFilename: 'page',
      savePath,
      format: 'png',
      width: 600,
      height: 800,
    };

    for (let i = 0; i < pageCount; i++) {
      options.saveFilename = `page-${i + 1}`;
      options.width = pdfDoc.getPage(i).getWidth();
      options.height = pdfDoc.getPage(i).getHeight();

      const newPdfDoc = await PDFDocument.create();
      const [page] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(page);

      const pdfBase64 = await newPdfDoc.saveAsBase64();

      const convert = fromBase64(pdfBase64, options);
      await convert(1);

      result.push(path.join(savePath, `${options.saveFilename}.1.png`));
    }
    return result;
  }
}
