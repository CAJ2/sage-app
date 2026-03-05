import { describe, expect, it, vi } from 'vitest'

import { getRequestFromContext } from '@src/auth/utils'

describe('getRequestFromContext', () => {
  it('returns req from GQL context', () => {
    const fakeReq = { url: '/graphql' }
    // GqlExecutionContext.create calls context.getArgs() — args[2] is the GraphQL context
    const ctx = {
      getType: () => 'graphql' as const,
      getArgs: () => [null, null, { req: fakeReq }, null],
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: vi.fn(),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn(),
    }
    const result = getRequestFromContext(ctx as any)
    expect(result).toBe(fakeReq)
  })

  it('returns WS client for ws context', () => {
    const fakeClient = { id: 'ws-client' }
    const ctx = {
      getType: () => 'ws' as const,
      switchToWs: () => ({ getClient: () => fakeClient }),
    }
    const result = getRequestFromContext(ctx as any)
    expect(result).toBe(fakeClient)
  })

  it('returns HTTP request for http context', () => {
    const fakeReq = { url: '/api/data' }
    const ctx = {
      getType: () => 'http' as const,
      switchToHttp: () => ({ getRequest: () => fakeReq }),
    }
    const result = getRequestFromContext(ctx as any)
    expect(result).toBe(fakeReq)
  })
})
