import { GraphQLError } from 'graphql'
import _ from 'lodash'
import { z } from 'zod'
import type { TransformFnParams } from 'class-transformer'

export const Locales = ['en-US', 'sv-SE'] as const

export type LocaleType = (typeof Locales)[number]

// Default language is represented as 'xx' in the database
// and it can only be saved when there no other known languages
// set and the input is of an unknown language.
const validFields = ['xx', ...Locales]
for (const lang of Locales) {
  validFields.push(lang.split('-')[0])
}
export const TranslatedJSON = z.record(z.string(), z.string()).refine(
  (data) => {
    const keys = Object.keys(data)
    for (const key of keys) {
      const keyParts = key.split(';')
      if (!validFields.includes(keyParts[0])) {
        return false
      }
      if (keyParts.length > 1 && keyParts[1] !== 'a') {
        return false
      }
      if (!data[key]) {
        return false
      }
    }
    return true
  },
  {
    message: 'Invalid translated field',
  },
)

type TF = z.infer<typeof TranslatedJSON>
export type TranslatedField = TF

export function defaultTranslatedField(): TranslatedField {
  return {}
}

export function isTranslatedField(
  data: Record<string, any>,
): data is TranslatedField {
  const result = TranslatedJSON.safeParse(data)
  return result.success
}

export function translate(params: TransformFnParams): string | undefined {
  const { value, obj } = params
  if (!value) {
    return value
  }
  if (!isTranslatedField(value)) {
    throw new GraphQLError('Invalid translated field')
  }
  const field: TranslatedField = value
  if (_.isArray(obj._lang)) {
    const lang: string[] = obj._lang
    const langKey = _.findKey(field, (value: any, key: string) => {
      return lang.includes(key.split(';')[0])
    })
    if (langKey) {
      return (field as any)[langKey]
    }
  }
  return field.xx
}

export function setTranslatedField(
  obj: TranslatedField | undefined,
  lang: string | undefined,
  value: string,
  isAuto = false,
): void {
  if (!lang) {
    lang = 'xx'
  }
  const bits = lang.split('-')
  if (bits.length >= 2) {
    lang = bits[0]
  }
  if (isAuto) {
    lang = `${lang};auto`
  }
  if (!obj) obj = {}
  obj[lang] = value
}

const supported = Locales.map((support) => {
  const bits = support.split('-')
  const hasScript = bits.length === 3

  return {
    text: support,
    code: bits[0],
    script: hasScript ? bits[1] : null,
    region: hasScript ? bits[2] : bits[1],
  }
}).sort((a, b) => {
  return b.code.length - a.code.length
})

export function parseLanguageHeader(header: string): string[] {
  // From https://github.com/opentable/accept-language-parser
  const strings: string[] = header.split(',')
  const langs = strings
    .map((m) => {
      if (!m) {
        return null
      }

      const bits = m.split(';')
      const ietf = bits[0].split('-')
      const hasScript = ietf.length === 3

      return {
        code: ietf[0],
        script: hasScript ? ietf[1] : null,
        region: hasScript ? ietf[2] : ietf[1],
        quality: bits[1] ? parseFloat(bits[1].split('=')[1]) : 1.0,
      }
    })
    .filter((r) => {
      return !!r
    })
    .sort((a, b) => {
      return b.quality - a.quality
    })

  const localeTypes: string[] = []
  for (let i = 0; i < langs.length; i++) {
    const lang = langs[i]
    const langCode = lang.code.toLowerCase()
    const langRegion = lang.region ? lang.region.toLowerCase() : lang.region
    const langScript = lang.script ? lang.script.toLowerCase() : lang.script
    for (let j = 0; j < supported.length; j++) {
      const supportedCode = supported[j].code.toLowerCase()
      const supportedScript = supported[j].script
        ? (supported[j].script as string).toLowerCase()
        : supported[j].script
      const supportedRegion = supported[j].region
        ? supported[j].region.toLowerCase()
        : supported[j].region
      if (
        langCode === supportedCode &&
        (!langScript || langScript === supportedScript) &&
        (!langRegion || langRegion === supportedRegion) &&
        !_.find(localeTypes, (l) => l === supported[j].text)
      ) {
        localeTypes.push(supported[j].text)
        localeTypes.push(supported[j].code)
      }
    }
  }
  if (localeTypes.length === 0) {
    localeTypes.push('en')
  }
  return localeTypes
}
