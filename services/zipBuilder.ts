import archiver from 'archiver';
import { Writable } from 'stream';

// ============================================
// ZIP BUILDER
// ============================================
export async function createZipFromAssets(
  assets: Map<string, Buffer>,
  brandName: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    // Create a writable stream to collect chunks
    const writableStream = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    // Create archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle errors
    archive.on('error', (err) => {
      reject(err);
    });

    // When finished, resolve with combined buffer
    writableStream.on('finish', () => {
      resolve(Buffer.concat(chunks));
    });

    // Pipe archive to writable stream
    archive.pipe(writableStream);

    // Add each asset to the archive
    for (const [path, buffer] of assets) {
      archive.append(buffer, { name: path });
    }

    // Finalize the archive
    archive.finalize();
  });
}

// ============================================
// FILENAME SANITIZER
// ============================================
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getZipFilename(brandName: string): string {
  const sanitized = sanitizeFilename(brandName);
  return `${sanitized}-brand-assets.zip`;
}

