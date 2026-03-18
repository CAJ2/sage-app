import { parseLanguageHeader } from '@src/common/i18n'
import { I18nService } from '@src/common/i18n.service'

describe('parseLanguageHeader', () => {
  it('expands en-US to include base code and iso3', () => {
    const result = parseLanguageHeader('en-US')
    expect(result).toContain('en-US')
    expect(result).toContain('en')
    expect(result).toContain('eng')
  })

  it('expands sv-SE to include base code and iso3', () => {
    const result = parseLanguageHeader('sv-SE')
    expect(result).toContain('sv-SE')
    expect(result).toContain('sv')
    expect(result).toContain('swe')
  })

  it('expands iso3 swe to include iso2 sv', () => {
    const result = parseLanguageHeader('swe')
    expect(result).toContain('swe')
    expect(result).toContain('sv')
  })

  it('expands unsupported iso3 fra to include iso2 fr', () => {
    const result = parseLanguageHeader('fra')
    expect(result).toContain('fra')
    expect(result).toContain('fr')
  })

  it('handles multi-language header with q values', () => {
    const result = parseLanguageHeader('en-US,fr;q=0.9')
    expect(result).toContain('en-US')
    expect(result).toContain('en')
    expect(result).toContain('eng')
    expect(result).toContain('fr')
    expect(result).toContain('fra')
  })

  it('returns fallback for empty header', () => {
    const result = parseLanguageHeader('', 'en')
    expect(result).toEqual(['en'])
  })
})

describe('I18nService.tr', () => {
  let service: I18nService
  let currentLang: string[]

  beforeEach(() => {
    currentLang = []
    const mockCls = { get: (_key: string) => currentLang } as any
    const mockI18nBase = { t: () => '' } as any
    service = new I18nService(mockI18nBase, mockCls)
  })

  it('returns string passthrough', () => {
    currentLang = ['en']
    expect(service.tr('plain string')).toBe('plain string')
  })

  it('returns undefined for undefined field', () => {
    currentLang = ['en']
    expect(service.tr(undefined)).toBeUndefined()
  })

  it('matches 3-char key when lang array includes iso3 (as parseLanguageHeader provides)', () => {
    currentLang = ['en-US', 'en', 'eng']
    expect(service.tr({ eng: 'English text' })).toBe('English text')
  })

  it('matches 2-char key via 3→2 expansion', () => {
    currentLang = ['swe', 'sv']
    expect(service.tr({ sv: 'Swedish text' })).toBe('Swedish text')
  })

  it('falls back to xx when no lang matches', () => {
    currentLang = ['en']
    expect(service.tr({ sv: 'Swedish', xx: 'Default' })).toBe('Default')
  })

  it('exact match on 2-char key', () => {
    currentLang = ['en']
    expect(service.tr({ en: 'Hello' })).toBe('Hello')
  })

  it('exact match with region tag', () => {
    currentLang = ['en-US', 'en']
    expect(service.tr({ 'en-US': 'American' })).toBe('American')
  })

  it('matches 3-char key when lang contains both 2 and 3 char forms', () => {
    currentLang = ['fr', 'fra']
    expect(service.tr({ fra: 'Bonjour', en: 'Hello' })).toBe('Bonjour')
  })

  it('matches key with auto modifier (;a)', () => {
    currentLang = ['en']
    expect(service.tr({ 'en;a': 'Hi' })).toBe('Hi')
  })

  it('picks preferred lang from all-modifier field', () => {
    currentLang = ['en']
    expect(service.tr({ 'en;a': 'Hi', 'sv;a': 'Hej' })).toBe('Hi')
  })

  it('picks sv when preferred from all-modifier field', () => {
    currentLang = ['sv']
    expect(service.tr({ 'en;a': 'Hi', 'sv;a': 'Hej' })).toBe('Hej')
  })

  it('matches region key with modifier', () => {
    currentLang = ['en-US', 'en']
    expect(service.tr({ 'en-US;a': 'American' })).toBe('American')
  })

  it('falls through modifier key via inexact match', () => {
    currentLang = ['en']
    expect(service.tr({ 'en-US;a': 'American' })).toBe('American')
  })
})
