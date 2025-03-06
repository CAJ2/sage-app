import { HttpException, HttpStatus } from '@nestjs/common'
import { GraphQLError } from 'graphql'

export function NotFoundErr(message: string, info?: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'NOT_FOUND',
      info,
    },
  })
}

export function BadRequestErr(message: string, info?: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'BAD_REQUEST',
      info,
    },
  })
}

export interface ErrorEntry {
  field?: string
  message: string
  info?: string
}

export class BaseException extends HttpException {
  errors: ErrorEntry[] = []

  constructor(errors: ErrorEntry[], status: HttpStatus) {
    super('', status)
    this.errors = errors
  }

  addError(error: ErrorEntry) {
    this.errors.push(error)
  }

  addFieldError(field: string, message: string, info?: string) {
    this.errors.push({ field, message, info })
  }
}

export class BadRequestException extends BaseException {
  constructor(errors: ErrorEntry[]) {
    super(errors, HttpStatus.BAD_REQUEST)
  }
}

export class UnauthorizedException extends BaseException {
  constructor(errors: ErrorEntry[]) {
    super(errors, HttpStatus.UNAUTHORIZED)
  }
}

export class ForbiddenException extends BaseException {
  constructor(errors: ErrorEntry[]) {
    super(errors, HttpStatus.FORBIDDEN)
  }
}

export class NotFoundException extends BaseException {
  constructor(errors: ErrorEntry[]) {
    super(errors, HttpStatus.NOT_FOUND)
  }
}
