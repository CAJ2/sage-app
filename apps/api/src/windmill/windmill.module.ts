import { Module } from '@nestjs/common'

import { WindmillService } from '@src/windmill/windmill.service'

@Module({
  providers: [WindmillService],
  exports: [WindmillService],
})
export class WindmillModule {}
