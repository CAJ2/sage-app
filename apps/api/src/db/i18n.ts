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

// Defines a class-transformer function to pick the appropriate language
// string from a JSON object containing one or more translations.
// Relies on the _lang property of the object to determine the best match.
export function translate(params: TransformFnParams): string | undefined {
  const { value, obj } = params
  if (!value) {
    return value
  }
  if (!isTranslatedField(value)) {
    console.error('Invalid translated field', value)
  }
  const field: TranslatedField = value
  if (_.isArray(obj._lang)) {
    const lang: string[] = obj._lang
    for (const l of lang) {
      const langKey = _.findKey(field, (value: any, key: string) => {
        return l === key.split(';')[0]
      })
      if (langKey) {
        return (field as any)[langKey]
      }
      const inexactKey = _.findKey(field, (value: any, key: string) => {
        const bits = key.split(';')
        return l === bits[0].split('-')[0] || bits[0].startsWith(l)
      })
      if (inexactKey) {
        return (field as any)[inexactKey]
      }
    }
  }
  return field.xx
}

// Modifies a TranslatedField JSON object to add a new translation.
// Supports a single string or an array of lang, text objects.
export function addTr(
  obj: TranslatedField | undefined,
  lang: string | undefined,
  value: string | { lang: string; text?: string }[],
  isAuto = false,
) {
  if (Array.isArray(value)) {
    for (const v of value) {
      if (!v.text) {
        // TODO: Remove existing text when null?
        continue
      }
      obj = addTr(obj, v.lang, v.text, isAuto)
    }
    return obj
  }
  if (!value) {
    return obj
  }
  if (!lang) {
    lang = 'xx'
  }
  const bits = lang.split('-')
  if (bits.length >= 2) {
    lang = bits[0]
  }
  if (isAuto) {
    lang = `${lang};a`
  }
  if (!obj) obj = {}
  obj[lang] = value
  return obj
}

// Like addTr, but throws an error if the resulting object
// is nullish (JSON object must have at least one translation).
export function addTrReq(
  obj: TranslatedField,
  lang: string | undefined,
  value: string | { lang: string; text?: string }[],
  isAuto = false,
): TranslatedField {
  const tr = addTr(obj, lang, value, isAuto)
  if (!tr) {
    throw new GraphQLError('Invalid translated field')
  }
  return tr
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

// Flattens a TranslatedField object into an object where each key is prepended
// by the name of the field.
// {"en": "Hello", "sv": "Hej"} => {"name_en": "Hello", "name_sv": "Hej"}
export function flattenTr(fieldName: string, obj: TranslatedField) {
  const result: Record<string, string> = {}
  for (const key in obj) {
    const value = obj[key]
    if (value) {
      result[`${fieldName}_${key}`] = value
    }
  }
  return result
}
