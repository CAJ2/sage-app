import { Injectable } from '@nestjs/common'
import { I18nTranslations } from '@src/i18n/i18n.generated'
import { type TransformFnParams } from 'class-transformer'
import { GraphQLError } from 'graphql'
import { ClsService } from 'nestjs-cls'
import { I18nService as I18nBaseService, Path, PathValue, TranslateOptions } from 'nestjs-i18n'
import { IfAnyOrNever } from 'nestjs-i18n/dist/types'
import { z } from 'zod/v4'

import { LANG_REGEX, translate, TranslatedField, TrArray, TrArraySchema } from './i18n'

@Injectable()
export class I18nService {
  constructor(
    private readonly i18n: I18nBaseService<I18nTranslations>,
    private readonly cls: ClsService,
  ) {}

  t<P extends Path<I18nTranslations> = any, R = PathValue<I18nTranslations, P>>(
    key: P,
    options?: TranslateOptions,
  ): IfAnyOrNever<R, string, R> {
    return this.i18n.t(key, options)
  }

  // Non class-transformer version of the translate function.
  tr(field: TranslatedField | undefined, lang: string[]): string | undefined {
    return translate({
      value: field,
      obj: {
        _lang: lang,
      },
    } as TransformFnParams)
  }

  // Modifies a TranslatedField JSON object to add a new translation.
  // Supports a single string or an array of lang, text objects.
  addTr(
    current: TranslatedField | undefined,
    value: string | TrArray,
    lang?: string | string[],
    auto?: boolean,
  ): TranslatedField | undefined {
    if (!value) {
      return current
    }
    if (Array.isArray(value)) {
      const arrSchema = TrArraySchema.transform((arr, ctx) => {
        if (!arr) return current
        const seenLangs = new Set<string>()
        const output: Record<string, string> = {}
        for (const item of arr) {
          if (seenLangs.has(item.lang)) {
            ctx.addIssue({
              code: 'invalid_key',
              input: item.lang,
              origin: 'record',
              issues: [
                {
                  code: 'custom',
                  input: item.lang,
                  path: ['lang'],
                  message: `Duplicate language code: ${item.lang}`,
                },
              ],
            })
            return z.NEVER
          }
          seenLangs.add(item.lang)
          let key: string = item.lang
          if (item.auto) {
            key += ';a'
          }
          if (item.text && item.text.length > 0) {
            output[key] = item.text
          }
        }
        if (Object.keys(output).length === 0) {
          ctx.addIssue({
            code: 'custom',
            input: arr,
            message: 'At least one translation must have non-empty text',
          })
          return z.NEVER
        }
        return output
      })
      const result = arrSchema.safeParse(value)
      if (result.success) {
        current = {
          ...current,
          ...result.data,
        }
      } else {
        throw result.error
      }
    }

    const reqLang = this.cls.get('lang')
    const langResult = z
      .union([z.string().regex(LANG_REGEX), z.array(z.string().regex(LANG_REGEX))])
      .default(reqLang)
      .transform((lang, ctx) => {
        // Always use the first (preferred) language if multiple are provided
        if (Array.isArray(lang)) {
          return lang[0]
        }
        return lang
      })
      .safeParse(lang)
    if (!langResult.success) {
      throw langResult.error
    }
    const valueResult = z.string().max(100_000).safeParse(value)
    if (!valueResult.success) {
      throw valueResult.error
    }

    let langStr = langResult.data
    const bits = langStr.split('-')
    if (bits.length >= 2) {
      langStr = bits[0]
    }
    if (auto) {
      langStr = `${langStr};a`
    }
    if (!current) current = {}
    current[langStr] = valueResult.data
    return current
  }

  // Like addTr, but throws an error if the resulting object
  // is nullish (JSON object must have at least one translation).
  addTrReq(
    current: TranslatedField,
    value: string | TrArray,
    lang?: string | string[],
    auto?: boolean,
  ): TranslatedField {
    const tr = this.addTr(current, value, lang, auto)
    if (!tr) {
      throw new GraphQLError('Invalid translated field')
    }
    return tr
  }
}
