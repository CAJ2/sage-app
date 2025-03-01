import { Extensions, Field, Float, ID, ObjectType } from '@nestjs/graphql'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { DateTime } from 'luxon'
import { z } from 'zod'
import { Material } from './material.model'

@ObjectType()
export class ComponentMaterial {
  @Field(() => Material)
  material!: Material

  @Field(() => Float, { nullable: true })
  material_fraction?: number
}

@ObjectType()
export class Component extends CreatedUpdated {
  @Field(() => ID)
  @Extensions({ z: z.string().nanoid() })
  id: string = ''

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().max(1024).optional() })
  name?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  desc?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  source?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  residential_stream?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  local_stream?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  commercial_stream?: string

  @Field(() => Boolean)
  @Extensions({ z: z.boolean() })
  hazardous: boolean = false

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  hazardous_info?: string

  @Field(() => Material)
  primary_material!: Material

  @Field(() => [ComponentMaterial])
  @Extensions({ z: z.array(z.any()).default([]) })
  materials: ComponentMaterial[] = []

  @Field(() => [ComponentHistory])
  @Extensions({ z: z.array(z.any()).default([]) })
  history: ComponentHistory[] = []
}

@ObjectType()
export class ComponentHistory {
  @Field(() => String)
  component_id!: string

  @Field(() => DateTime)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}
