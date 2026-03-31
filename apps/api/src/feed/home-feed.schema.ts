import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { TransformInput, ZService } from '@src/common/z.service'
import { HomeFeed as HomeFeedEntity } from '@src/feed/home-feed.entity'
import { FeedFormat, FeedItem } from '@src/feed/home-feed.model'

const MARKDOWN_SHORT_LENGTH = 200

function buildShareText(
  title: string,
  format: FeedFormat,
  link?: { entityName: string; id: string },
  externalLink?: { url: string },
): string {
  const prefix: Record<FeedFormat, string> = {
    [FeedFormat.ANNOUNCEMENT]: 'Announcement: ',
    [FeedFormat.ARTICLE]: '',
    [FeedFormat.EXTERNAL]: '',
    [FeedFormat.FEATURE]: 'Feature spotlight: ',
    [FeedFormat.PROJECT]: 'Project: ',
    [FeedFormat.UPDATE]: 'Update: ',
  }
  let text = `${prefix[format]}${title}`
  if (format === FeedFormat.EXTERNAL && externalLink) {
    text += ` — ${externalLink.url}`
  } else if (link) {
    text += ` (sage://${link.entityName}/${link.id})`
  }
  return text
}

@Injectable()
export class HomeFeedSchemaService {
  constructor(private readonly zService: ZService) {
    const HomeFeedTransform = z.transform((input: TransformInput) => {
      const entity = input.input as HomeFeedEntity
      const model = new FeedItem()
      model.id = entity.id
      model.createdAt = DateTime.fromJSDate(entity.createdAt)
      model.updatedAt = DateTime.fromJSDate(entity.updatedAt)
      model.format = entity.format as FeedFormat
      model.category = entity.category ? input.i18n.tr(entity.category) : undefined
      model.title = input.i18n.tr(entity.title) as string
      const md = entity.content?.markdown ? input.i18n.tr(entity.content.markdown) : undefined
      model.markdown = md
      model.markdownShort = md ? md.slice(0, MARKDOWN_SHORT_LENGTH) : undefined
      model.link = entity.links?.link
      model.externalLink = entity.links?.externalLink
      model.shareText = buildShareText(
        model.title,
        model.format,
        entity.links?.link,
        entity.links?.externalLink,
      )
      return model
    })
    this.zService.registerEntityTransform(HomeFeedEntity, FeedItem, HomeFeedTransform)
  }
}
