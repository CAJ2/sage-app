import Ajv2020 from 'ajv/dist/2020'
import { core, z } from 'zod/v4'
import { util } from 'zod/v4/core'

export const AjvTemplateSchema = new Ajv2020({
  allErrors: true,
  strict: false,
  useDefaults: true,
  removeAdditional: true,
})

export type JSONType = util.JSONType
export type JSONObject = { [key: string]: JSONType }
export const ZJSONObject = z.record(z.string(), z.json())

export const HTTPS_OR_ICON: core.$ZodURLParams = {
  protocol: /^https|icon$/,
}
