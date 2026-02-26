import { HttpException, HttpStatus } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import { ZodIssue } from 'zod/v4'

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

export function ConflictErr(message: string, info?: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'CONFLICT',
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

export function httpStatusToCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST'
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED'
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN'
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND'
    case HttpStatus.CONFLICT:
      return 'CONFLICT'
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'UNPROCESSABLE_ENTITY'
    default:
      return 'INTERNAL_SERVER_ERROR'
  }
}

export function zodIssuesToFieldErrors(issues: ZodIssue[]): ErrorEntry[] {
  return issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : undefined,
    message: issue.message,
  }))
}
