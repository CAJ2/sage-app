import { Controller, Get } from '@nestjs/common'

import { AppService } from '@src/app.service'
import { AllowAnonymous } from '@src/auth/decorators'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @AllowAnonymous()
  getHello(): string {
    return this.appService.getHello()
  }
}
