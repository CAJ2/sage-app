import { registerDecorator, ValidatorConstraint } from 'class-validator'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'
import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ name: 'nanoid', async: false })
export class IsNanoID implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return (
      text.length === 21 &&
      _.every(text, (c) =>
        'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'.includes(
          c,
        ),
      )
    )
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid ID'
  }
}

@ValidatorConstraint({ name: 'isDateTime', async: false })
export class IsDateTime implements ValidatorConstraintInterface {
  validate(value: unknown, validationArguments?: ValidationArguments) {
    if (value instanceof DateTime) {
      return value.isValid
    } else if (typeof value === 'string') {
      return DateTime.fromISO(value).isValid
    }
    return false
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid datetime'
  }
}

export function ZodValid(
  schema: z.ZodType,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'ZodValid',
      target: object.constructor,
      propertyName,
      constraints: [schema],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [zodSchema] = args.constraints
          const result = zodSchema.safeParse(value)
          return result.success
        },
      },
    })
  }
}
