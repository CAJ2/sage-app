import { Injectable } from '@nestjs/common'
import type { CompletedJob, Job } from 'windmill-client'

import type {
  IWindmillService,
  PollOpts,
  RunOpts,
  WaitRunOpts,
} from '@src/windmill/windmill.service'

@Injectable()
export class WindmillMockService implements IWindmillService {
  private defaultResult: unknown = undefined
  private pathResults = new Map<string, unknown>()

  /** Set the result returned for all calls that don't have a path-specific result. */
  setMockedResult(result: unknown): void {
    this.defaultResult = result
  }

  /** Set the result returned for calls targeting a specific script/flow path. */
  setMockedResultForPath(path: string, result: unknown): void {
    this.pathResults.set(path, result)
  }

  /** Clear all mocked results. */
  clearMockedResults(): void {
    this.defaultResult = undefined
    this.pathResults.clear()
  }

  private getResult<T>(path?: string): T {
    if (path !== undefined && this.pathResults.has(path)) {
      return this.pathResults.get(path) as T
    }
    return this.defaultResult as T
  }

  private fakeJobId(): string {
    return crypto.randomUUID()
  }

  async runScript(
    _path: string,
    _args: Record<string, unknown>,
    _opts: RunOpts = {},
  ): Promise<string> {
    return this.fakeJobId()
  }

  async runFlow(
    _path: string,
    _args: Record<string, unknown>,
    _opts: RunOpts = {},
  ): Promise<string> {
    return this.fakeJobId()
  }

  async runScriptAndWait<T = unknown>(
    path: string,
    _args: Record<string, unknown>,
    _opts: WaitRunOpts = {},
  ): Promise<T> {
    return this.getResult<T>(path)
  }

  async runFlowAndWait<T = unknown>(
    path: string,
    _args: Record<string, unknown>,
    _opts: WaitRunOpts = {},
  ): Promise<T> {
    return this.getResult<T>(path)
  }

  async getJob(_id: string, _workspace?: string): Promise<Job> {
    return { type: 'CompletedJob', success: true, result: this.getResult() } as unknown as Job
  }

  async getJobResult<T = unknown>(_id: string, _workspace?: string): Promise<T> {
    return this.getResult<T>()
  }

  async getCompletedJob(_id: string, _workspace?: string): Promise<CompletedJob> {
    return { success: true, result: this.getResult() } as unknown as CompletedJob
  }

  async pollJobResult<T = unknown>(_id: string, _opts: PollOpts = {}): Promise<T> {
    return this.getResult<T>()
  }
}
