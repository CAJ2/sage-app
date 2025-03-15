import { Field, Float, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { Component as ComponentEntity } from './component.entity'
import { Material } from './material.model'

@ObjectType()
export class ComponentMaterial {
  @Field(() => Material)
  material!: Material

  @Field(() => Float, { nullable: true })
  material_fraction?: number
}

@ObjectType()
export class Component extends IDCreatedUpdated<ComponentEntity> {
  @Field(() => String, { nullable: true })
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => String, { nullable: true })
  source?: string

  @Field(() => String, { nullable: true })
  residential_stream?: string

  @Field(() => String, { nullable: true })
  local_stream?: string

  @Field(() => String, { nullable: true })
  commercial_stream?: string

  @Field(() => Boolean)
  hazardous: boolean = false

  @Field(() => String, { nullable: true })
  hazardous_info?: string

  @Field(() => Material)
  primary_material!: Material

  @Field(() => [ComponentMaterial])
  materials: ComponentMaterial[] = []

  @Field(() => [ComponentHistory])
  history: ComponentHistory[] = []
}

@ObjectType()
export class ComponentHistory {
  @Field(() => String)
  component_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}
