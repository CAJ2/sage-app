import { createWriteStream, unlink } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { nanoid } from 'nanoid'

import { SourceType } from '@src/changes/source.entity'

// Explicit MIME type → SourceType allowlist. Unknown MIME types are rejected.
const MIME_TO_SOURCE_TYPE: Record<string, SourceType> = {
  // Images
  'image/jpeg': SourceType.IMAGE,
  'image/png': SourceType.IMAGE,
  'image/webp': SourceType.IMAGE,
  // PDF
  'application/pdf': SourceType.PDF,
  // Files
  'application/json': SourceType.FILE,
  'application/xml': SourceType.FILE,
  'text/xml': SourceType.FILE,
}

function resolveSourceType(mimeType: string): SourceType {
  const type = MIME_TO_SOURCE_TYPE[mimeType]
  if (type) return type
  throw new BadRequestException(`Unsupported file type: ${mimeType}`)
}

const SPACES_REGION = 'fra1'
const SPACES_BUCKET = 'sage-leaf-sources'
const SPACES_ENDPOINT = `https://${SPACES_REGION}.digitaloceanspaces.com`

function getExtension(filename: string, mimeType: string): string {
  const fromFilename = extname(filename)
  if (fromFilename) return fromFilename

  // Fallback extension from MIME type
  const mimeExtensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/json': '.json',
    'application/xml': '.xml',
    'text/xml': '.xml',
  }
  return mimeExtensions[mimeType] ?? ''
}

function bufferToTempFile(stream: NodeJS.ReadableStream, tempPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const writeStream = createWriteStream(tempPath)

    writeStream.on('finish', resolve)
    writeStream.on('error', (error) => {
      unlink(tempPath, () => {
        reject(error)
      })
    })

    stream.on('error', (error) => writeStream.destroy(error))
    stream.pipe(writeStream)
  })
}

@Injectable()
export class StorageService {
  private readonly s3: S3Client

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      endpoint: SPACES_ENDPOINT,
      region: SPACES_REGION,
      credentials: {
        accessKeyId: this.config.get<string>('spaces.key') ?? '',
        secretAccessKey: this.config.get<string>('spaces.secret') ?? '',
      },
      forcePathStyle: false,
    })
  }

  /**
   * Uploads a GraphQL file upload to DigitalOcean Spaces.
   * Buffers via a temp file first for robustness.
   * Returns the cdn:// URL and the resolved SourceType.
   */
  async uploadSource(
    upload: Promise<FileUpload>,
  ): Promise<{ cdnUrl: string; sourceType: SourceType }> {
    const { createReadStream, filename, mimetype } = await upload

    const sourceType = resolveSourceType(mimetype)
    const ext = getExtension(filename, mimetype)
    const key = `uploads/${nanoid()}${ext}`
    const tempPath = join(tmpdir(), `sage-upload-${nanoid()}${ext}`)

    const stream = createReadStream()
    await bufferToTempFile(stream, tempPath)

    try {
      const { createReadStream: createTempStream } = await import('node:fs').then((m) => ({
        createReadStream: () => m.createReadStream(tempPath),
      }))

      await this.s3.send(
        new PutObjectCommand({
          Bucket: SPACES_BUCKET,
          Key: key,
          Body: createTempStream(),
          ContentType: mimetype,
          ACL: 'public-read',
        }),
      )
    } finally {
      unlink(tempPath, () => {})
    }

    return {
      cdnUrl: `cdn://sources/${key}`,
      sourceType,
    }
  }
}

export { resolveSourceType }
