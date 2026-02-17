import { DriverException } from '@mikro-orm/core'
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common'
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql'
import { Response } from 'express'

import {
  BadRequestException,
  BaseException,
  ErrorEntry,
  ForbiddenException,
  NotFoundException,
} from './exceptions'

@Catch(
  HttpException,
  BaseException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  DriverException,
)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const gql = GqlArgumentsHost.create(host)
    const ctx = gql.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.OK
    if (exception instanceof HttpException) {
      status = exception.getStatus()
    }

    let errors: ErrorEntry[] = []
    if (exception instanceof BaseException) {
      errors = exception.errors
    }

    const resBody = {
      errors,
    }
    if (exception instanceof HttpException && exception.message) {
      errors.push({ message: exception.message })
    }

    if (response.status) {
      response.status(status).json(resBody)
    } else {
      if (exception instanceof HttpException || exception instanceof BaseException) {
        exception.message = 'Internal Server Error'
      }
      return exception
    }
  }
}
