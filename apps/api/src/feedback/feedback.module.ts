import { Module } from '@nestjs/common'

import { CommonModule } from '@src/common/common.module'
import { FeedbackResolver } from '@src/feedback/feedback.resolver'
import { FeedbackSchemaService } from '@src/feedback/feedback.schema'
import { FeedbackService } from '@src/feedback/feedback.service'

@Module({
  imports: [CommonModule],
  providers: [FeedbackResolver, FeedbackService, FeedbackSchemaService],
})
export class FeedbackModule {}
