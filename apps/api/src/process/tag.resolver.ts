import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'

import { OptionalAuth } from '@src/auth/decorators'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { ZService } from '@src/common/z.service'
import {
  CreateTagDefinitionInput,
  CreateTagDefinitionOutput,
  Tag,
  TagArgs,
  TagPage,
  UpdateTagDefinitionInput,
  UpdateTagDefinitionOutput,
} from '@src/process/tag.model'
import { TagService } from '@src/process/tag.service'

@Resolver(() => Tag)
export class TagResolver {
  constructor(
    private readonly tagService: TagService,
    private readonly transform: TransformService,
    private readonly z: ZService,
  ) {}

  @Query(() => TagPage, { name: 'tags' })
  @OptionalAuth()
  async tags(@Args() args: TagArgs): Promise<TagPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(TagArgs, args)
    const cursor = await this.tagService.find(filter)
    return this.transform.entityToPaginated(Tag, TagPage, cursor, parsedArgs)
  }

  @Query(() => Tag, { name: 'tag', nullable: true })
  @OptionalAuth()
  async tag(@Args('id', { type: () => ID }) id: string): Promise<Tag> {
    const tag = await this.tagService.findOneByID(id)
    if (!tag) {
      throw NotFoundErr('Tag not found')
    }
    return this.transform.entityToModel(Tag, tag)
  }

  @Mutation(() => CreateTagDefinitionOutput, {
    name: 'createTagDefinition',
    nullable: true,
  })
  async createTagDefinition(
    @Args('input') input: CreateTagDefinitionInput,
  ): Promise<CreateTagDefinitionOutput> {
    input = await this.z.parse(CreateTagDefinitionInput.schema, input)
    const created = await this.tagService.create(input)
    const model = await this.transform.entityToModel(Tag, created)
    return {
      tag: model,
    }
  }

  @Mutation(() => UpdateTagDefinitionOutput, {
    name: 'updateTagDefinition',
    nullable: true,
  })
  async updateTagDefinition(
    @Args('input') input: UpdateTagDefinitionInput,
  ): Promise<UpdateTagDefinitionOutput> {
    const updated = await this.tagService.update(input)
    const model = await this.transform.entityToModel(Tag, updated)
    return {
      tag: model,
    }
  }
}
