import { Injectable } from '@nestjs/common'

import { FeedbackAction } from '@src/feedback/feedback.entity'

@Injectable()
export class FeedbackSchemaService {
  getSchema(action: FeedbackAction): { schema?: object; uischema?: object } {
    if (action === FeedbackAction.DOWNVOTE) {
      return {
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
          },
        },
        uischema: {
          type: 'VerticalLayout',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/details',
              options: { multi: true },
            },
          ],
        },
      }
    }
    return {}
  }
}
