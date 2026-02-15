import { createUnionType, registerEnumType } from '@nestjs/graphql'

import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import { Component } from '@src/process/component.model'
import { Material } from '@src/process/material.model'
import { Process } from '@src/process/process.model'
import { Category } from '@src/product/category.model'
import { Item } from '@src/product/item.model'
import { Variant } from '@src/product/variant.model'

import { ChangeStatus } from './change.entity'

registerEnumType(ChangeStatus, {
  name: 'ChangeStatus',
  description: 'Status of a change',
})

export const EditModel = createUnionType({
  name: 'EditModel',
  types: () => [Place, Region, Component, Material, Process, Category, Item, Variant] as const,
})

export enum EditModelType {
  Place = 'Place',
  Region = 'Region',
  Component = 'Component',
  Material = 'Material',
  Process = 'Process',
  Category = 'Category',
  Item = 'Item',
  Variant = 'Variant',
}

registerEnumType(EditModelType, {
  name: 'EditModelType',
  description: 'Type of the model being edited',
})
