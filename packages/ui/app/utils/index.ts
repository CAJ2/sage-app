import { cloneDeep, isNull, omitBy } from 'lodash-es'

export const sanitizeFormData = <U extends object>(
  data: U | null | undefined,
): Record<string, unknown> => {
  if (!data) {
    return {}
  }
  return omitBy(cloneDeep(data), isNull) as Record<string, unknown>
}
