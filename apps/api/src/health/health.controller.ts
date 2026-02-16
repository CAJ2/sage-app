import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService, MikroOrmHealthIndicator } from '@nestjs/terminus'

import { AllowAnonymous } from '@src/auth/decorators'

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MikroOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @AllowAnonymous()
  check() {
    return this.health.check([() => this.db.pingCheck('database')])
  }
}
