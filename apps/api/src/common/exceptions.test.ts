import { describe, expect, it } from 'vitest'

import {
  BadRequestErr,
  BadRequestException,
  ConflictErr,
  ForbiddenException,
  httpStatusToCode,
  NotFoundErr,
  NotFoundException,
  UnauthorizedException,
  zodIssuesToFieldErrors,
} from '@src/common/exceptions'

describe('NotFoundErr', () => {
  it('sets the message', () => {
    expect(NotFoundErr('thing not found').message).toBe('thing not found')
  })

  it('sets code to NOT_FOUND', () => {
    expect(NotFoundErr('msg').extensions.code).toBe('NOT_FOUND')
  })

  it('includes info when provided', () => {
    expect(NotFoundErr('msg', 'some hint').extensions.info).toBe('some hint')
  })

  it('omits info when not provided', () => {
    expect(NotFoundErr('msg').extensions.info).toBeUndefined()
  })
})

describe('BadRequestErr', () => {
  it('sets the message', () => {
    expect(BadRequestErr('invalid input').message).toBe('invalid input')
  })

  it('sets code to BAD_REQUEST', () => {
    expect(BadRequestErr('msg').extensions.code).toBe('BAD_REQUEST')
  })

  it('includes info when provided', () => {
    expect(BadRequestErr('msg', 'hint').extensions.info).toBe('hint')
  })

  it('omits info when not provided', () => {
    expect(BadRequestErr('msg').extensions.info).toBeUndefined()
  })
})

describe('ConflictErr', () => {
  it('sets the message', () => {
    expect(ConflictErr('already exists').message).toBe('already exists')
  })

  it('sets code to CONFLICT', () => {
    expect(ConflictErr('msg').extensions.code).toBe('CONFLICT')
  })

  it('includes info when provided', () => {
    expect(ConflictErr('msg', 'hint').extensions.info).toBe('hint')
  })

  it('omits info when not provided', () => {
    expect(ConflictErr('msg').extensions.info).toBeUndefined()
  })
})

describe('BadRequestException', () => {
  it('stores initial errors', () => {
    const ex = new BadRequestException([{ message: 'x' }])
    expect(ex.errors[0].message).toBe('x')
  })

  it('returns HTTP 400', () => {
    expect(new BadRequestException([]).getStatus()).toBe(400)
  })
})

describe('UnauthorizedException', () => {
  it('returns HTTP 401', () => {
    expect(new UnauthorizedException([]).getStatus()).toBe(401)
  })
})

describe('ForbiddenException', () => {
  it('returns HTTP 403', () => {
    expect(new ForbiddenException([]).getStatus()).toBe(403)
  })
})

describe('NotFoundException', () => {
  it('returns HTTP 404', () => {
    expect(new NotFoundException([]).getStatus()).toBe(404)
  })
})

describe('BaseException.addError', () => {
  it('pushes an error entry', () => {
    const ex = new BadRequestException([])
    ex.addError({ message: 'y' })
    expect(ex.errors).toHaveLength(1)
    expect(ex.errors[0].message).toBe('y')
  })
})

describe('BaseException.addFieldError', () => {
  it('pushes a field error with all fields', () => {
    const ex = new BadRequestException([])
    ex.addFieldError('email', 'bad email', 'hint')
    expect(ex.errors[0].field).toBe('email')
    expect(ex.errors[0].message).toBe('bad email')
    expect(ex.errors[0].info).toBe('hint')
  })

  it('omits info when not provided', () => {
    const ex = new BadRequestException([])
    ex.addFieldError('name', 'required')
    expect(ex.errors[0].info).toBeUndefined()
  })
})

describe('httpStatusToCode', () => {
  it.each([
    [400, 'BAD_REQUEST'],
    [401, 'UNAUTHORIZED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
    [409, 'CONFLICT'],
    [422, 'UNPROCESSABLE_ENTITY'],
    [500, 'INTERNAL_SERVER_ERROR'],
    [503, 'INTERNAL_SERVER_ERROR'],
  ])('maps status %i to %s', (status, expected) => {
    expect(httpStatusToCode(status)).toBe(expected)
  })
})

describe('zodIssuesToFieldErrors', () => {
  it('maps a single issue with a path', () => {
    const result = zodIssuesToFieldErrors([
      { path: ['email'], message: 'bad', code: 'custom' } as any,
    ])
    expect(result).toEqual([{ field: 'email', message: 'bad' }])
  })

  it('joins nested paths with a dot', () => {
    const result = zodIssuesToFieldErrors([
      { path: ['a', 'b'], message: 'nested', code: 'custom' } as any,
    ])
    expect(result[0].field).toBe('a.b')
  })

  it('sets field to undefined when path is empty', () => {
    const result = zodIssuesToFieldErrors([
      { path: [], message: 'global error', code: 'custom' } as any,
    ])
    expect(result[0].field).toBeUndefined()
  })

  it('maps multiple issues', () => {
    const result = zodIssuesToFieldErrors([
      { path: ['email'], message: 'bad', code: 'custom' } as any,
      { path: ['name'], message: 'required', code: 'custom' } as any,
    ])
    expect(result).toHaveLength(2)
  })
})
