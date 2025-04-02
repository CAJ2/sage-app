import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  CreateTagInput,
  Tag,
  TagArgs,
  TagPage,
  UpdateTagInput,
} from './tag.model'
import { TagService } from './tag.service'

@Resolver(() => Tag)
export class TagResolver {
  constructor(
    private readonly tagService: TagService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => TagPage, { name: 'getTags' })
  async getTags(@Args() args: TagArgs): Promise<TagPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.tagService.find(filter)
    return this.transform.entityToPaginated(cursor, args, Tag, TagPage)
  }

  @Query(() => Tag, { name: 'getTag' })
  async getTag(@Args('id', { type: () => ID }) id: string): Promise<Tag> {
    const tag = await this.tagService.findOneByID(id)
    if (!tag) {
      throw NotFoundErr('Tag not found')
    }
    return this.transform.entityToModel(tag, Tag)
  }

  @Mutation(() => Tag, { name: 'createTag' })
  async createTag(@Args('input') input: CreateTagInput): Promise<Tag> {
    const created = await this.tagService.create(input)
    return this.transform.entityToModel(created, Tag)
  }

  @Mutation(() => Tag, { name: 'updateTag' })
  async updateTag(@Args('input') input: UpdateTagInput): Promise<Tag> {
    const updated = await this.tagService.update(input)
    return this.transform.entityToModel(updated, Tag)
  }
}
