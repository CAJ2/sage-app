import { UseGuards } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthGuard } from '@src/auth/auth.guard'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  CreateTagDefinitionInput,
  CreateTagDefinitionOutput,
  Tag,
  TagArgs,
  TagPage,
  UpdateTagDefinitionInput,
  UpdateTagDefinitionOutput,
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

  @Query(() => Tag, { name: 'getTag', nullable: true })
  async getTag(@Args('id', { type: () => ID }) id: string): Promise<Tag> {
    const tag = await this.tagService.findOneByID(id)
    if (!tag) {
      throw NotFoundErr('Tag not found')
    }
    return this.transform.entityToModel(tag, Tag)
  }

  @Mutation(() => CreateTagDefinitionOutput, {
    name: 'createTagDefinition',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async createTagDefinition(
    @Args('input') input: CreateTagDefinitionInput,
  ): Promise<CreateTagDefinitionOutput> {
    const created = await this.tagService.create(input)
    const model = await this.transform.entityToModel(created, Tag)
    return {
      tag: model,
    }
  }

  @Mutation(() => UpdateTagDefinitionOutput, {
    name: 'updateTagDefinition',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async updateTagDefinition(
    @Args('input') input: UpdateTagDefinitionInput,
  ): Promise<UpdateTagDefinitionOutput> {
    const updated = await this.tagService.update(input)
    const model = await this.transform.entityToModel(updated, Tag)
    return {
      tag: model,
    }
  }
}
