import { expandCdnUrl, shrinkCdnUrl } from './cdn'

describe('CDN utils', () => {
  describe('shrinkCdnUrl', () => {
    it('shrinks known CDN prefixes', () => {
      expect(
        shrinkCdnUrl(
          'https://sage-leaf-sources.fra1.cdn.digitaloceanspaces.com/off/00000758/1.400.jpg',
        ),
      ).toBe('cdn://sources/off/00000758/1.400.jpg')
    })

    it('leaves unknown URLs alone', () => {
      expect(shrinkCdnUrl('https://example.com/test.jpg')).toBe('https://example.com/test.jpg')
    })

    it('handles null/undefined', () => {
      expect(shrinkCdnUrl(null)).toBe(null)
      expect(shrinkCdnUrl(undefined)).toBe(undefined)
    })
  })

  describe('expandCdnUrl', () => {
    it('expands known CDN prefixes', () => {
      expect(expandCdnUrl('cdn://sources/off/00000758/1.400.jpg')).toBe(
        'https://sage-leaf-sources.fra1.cdn.digitaloceanspaces.com/off/00000758/1.400.jpg',
      )
    })

    it('leaves unknown URLs alone', () => {
      expect(expandCdnUrl('https://example.com/test.jpg')).toBe('https://example.com/test.jpg')
    })

    it('handles null/undefined', () => {
      expect(expandCdnUrl(null as any)).toBe(null)
      expect(expandCdnUrl(undefined)).toBe(undefined)
    })
  })
})
