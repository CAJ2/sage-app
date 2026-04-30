import { BadRequestException } from '@nestjs/common'

import { SourceType } from '@src/changes/source.entity'
import { resolveSourceType } from '@src/common/storage.service'

describe('resolveSourceType', () => {
  it('maps allowed image MIME types to IMAGE', () => {
    expect(resolveSourceType('image/jpeg')).toBe(SourceType.IMAGE)
    expect(resolveSourceType('image/png')).toBe(SourceType.IMAGE)
    expect(resolveSourceType('image/webp')).toBe(SourceType.IMAGE)
  })

  it('rejects disallowed image types', () => {
    expect(() => resolveSourceType('image/gif')).toThrow(BadRequestException)
    expect(() => resolveSourceType('image/svg+xml')).toThrow(BadRequestException)
    expect(() => resolveSourceType('image/avif')).toThrow(BadRequestException)
    expect(() => resolveSourceType('image/tiff')).toThrow(BadRequestException)
    expect(() => resolveSourceType('image/bmp')).toThrow(BadRequestException)
  })

  it('maps application/pdf to PDF', () => {
    expect(resolveSourceType('application/pdf')).toBe(SourceType.PDF)
  })

  it('rejects all video MIME types', () => {
    expect(() => resolveSourceType('video/mp4')).toThrow(BadRequestException)
    expect(() => resolveSourceType('video/webm')).toThrow(BadRequestException)
    expect(() => resolveSourceType('video/mpeg')).toThrow(BadRequestException)
    expect(() => resolveSourceType('video/quicktime')).toThrow(BadRequestException)
  })

  it('maps json and xml to FILE', () => {
    expect(resolveSourceType('application/json')).toBe(SourceType.FILE)
    expect(resolveSourceType('application/xml')).toBe(SourceType.FILE)
    expect(resolveSourceType('text/xml')).toBe(SourceType.FILE)
  })

  it('rejects previously allowed file types that are no longer allowed', () => {
    expect(() => resolveSourceType('application/zip')).toThrow(BadRequestException)
    expect(() => resolveSourceType('application/octet-stream')).toThrow(BadRequestException)
    expect(() => resolveSourceType('application/msword')).toThrow(BadRequestException)
    expect(() => resolveSourceType('text/plain')).toThrow(BadRequestException)
    expect(() => resolveSourceType('text/csv')).toThrow(BadRequestException)
  })

  it('throws BadRequestException for unknown MIME types', () => {
    expect(() => resolveSourceType('application/x-unknown-type')).toThrow(BadRequestException)
    expect(() => resolveSourceType('audio/mpeg')).toThrow(BadRequestException)
    expect(() => resolveSourceType('font/woff2')).toThrow(BadRequestException)
    expect(() => resolveSourceType('')).toThrow(BadRequestException)
  })

  it('throws BadRequestException with a descriptive message', () => {
    expect(() => resolveSourceType('audio/mpeg')).toThrow('Unsupported file type: audio/mpeg')
  })
})
