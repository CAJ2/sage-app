import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { INestApplication } from '@nestjs/common'
import { type ExecutionResult, print } from 'graphql'
import request from 'supertest'
import type TestAgent from 'supertest/lib/agent'

/**
 * Utility class to simplify making GraphQL requests in tests.
 */
export class GraphQLTestClient {
  private app: INestApplication
  private agent: TestAgent
  private headers?: Record<string, any>
  private cookies: string[] = []

  constructor(app: INestApplication) {
    this.app = app
    this.agent = request(app.getHttpServer())
  }

  /**
   * Sign in with username and password using BetterAuth.
   * Stores the resulting cookies for subsequent requests.
   * @param username Username or email
   * @param password Password
   */
  async signIn(username: string, password: string): Promise<void> {
    const res = await this.agent
      .post('/auth/sign-in/username')
      .send({ username, password })

    if (res.status !== 200) {
      throw new Error(
        `Sign in failed with status ${res.status}: ${JSON.stringify(res.body)}`,
      )
    }

    // Extract and store cookies from the response
    const setCookieHeaders = res.headers['set-cookie']
    if (setCookieHeaders) {
      console.warn(setCookieHeaders)
      this.cookies = Array.isArray(setCookieHeaders)
        ? setCookieHeaders
        : [setCookieHeaders]
    }
  }

  /**
   * Clear stored authentication cookies.
   */
  clearAuth(): void {
    this.cookies = []
  }

  /**
   * Send a GraphQL query or mutation.
   * @param query GraphQL query string
   * @param variables Variables object (optional)
   * @param options Optional: { headers?: Record<string, string> }
   */
  async send<TResult, TVariables>(
    operation: TypedDocumentNode<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
  ): Promise<ExecutionResult<TResult>> {
    let req = this.agent.post('/graphql')

    // Apply stored cookies if any
    if (this.cookies.length > 0) {
      req = req.set(
        'Cookie',
        this.cookies.map((c) => c.split(';')[0]).join('; '),
      )
    }

    // Apply custom headers
    if (this.headers) {
      for (const [key, value] of Object.entries(this.headers)) {
        req = req.set(key, value)
      }
    }

    const res = await req.send({
      query: print(operation),
      variables: variables ?? undefined,
    })
    return res.body
  }
}
