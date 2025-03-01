import { z } from 'zod'

export const Locales = ['en-US', 'sv-SE'] as const

export type LocaleType = (typeof Locales)[number]

export type LocaleText = {
  auto: boolean
  text: string
}

const ValidFields = ['default', ...Locales] as const
export const TranslatedJSON = z
  .record(
    z.enum(ValidFields),
    z.object({
      auto: z.boolean(),
      text: z.string(),
    })
  )
  .refine(data => data.default !== undefined, 'Default text is required')

type TF = z.infer<typeof TranslatedJSON>
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {}
export type TranslatedField = Simplify<
  Omit<TF, 'default'> & Required<Pick<TF, 'default'>>
>

export function isTranslatedField (
  data: Record<string, any>
): data is TranslatedField {
  return TranslatedJSON.safeParse(data).success
}
