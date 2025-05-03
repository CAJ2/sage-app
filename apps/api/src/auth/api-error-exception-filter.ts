import { Catch, HttpStatus, UnauthorizedException } from '@nestjs/common'
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql'
import { APIError } from 'better-auth/api'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'

@Catch(APIError)
export class APIErrorExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  catch(exception: APIError, host: ArgumentsHost) {
    const gql = GqlArgumentsHost.create(host)
    const response = gql.switchToHttp().getResponse()
    const status = exception.statusCode
    const message = exception.body?.message

    if (host.getType() === 'http') {
      response.status(status).json({
        errors: [{ message }],
      })
      return
    }
    if (status === HttpStatus.UNAUTHORIZED) {
      return new UnauthorizedException()
    }
  }
}
