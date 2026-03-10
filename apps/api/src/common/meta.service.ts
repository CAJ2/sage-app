import { BaseEntity } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { DiscoveryService } from '@nestjs/core'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'

import { IEntityService, IsEntityService } from '@src/db/base.entity'

@Injectable()
export class MetaService {
  private isInit = false
  private entityServicesByString: Map<string, InstanceWrapper<any>> = new Map()
  private entityServicesByEntity: Map<Function, InstanceWrapper<any>> = new Map()

  constructor(private readonly discovery: DiscoveryService) {}

  async findEntityService(
    entity: string | BaseEntity | Function,
  ): Promise<IEntityService<any> | null> {
    if (!this.isInit) {
      this.cacheProviders()
      this.isInit = true
    }
    let wrapper: InstanceWrapper<any> | undefined
    if (typeof entity === 'function') {
      wrapper = this.entityServicesByEntity.get(entity)
    } else if (typeof entity === 'string') {
      wrapper = this.entityServicesByString.get(entity)
    } else if (entity instanceof BaseEntity) {
      wrapper = this.entityServicesByEntity.get(entity as any)
    }
    return wrapper?.instance ?? null
  }

  private cacheProviders() {
    const providers = this.discovery.getProviders()
    const entityServices = providers.filter((p) =>
      this.discovery.getMetadataByDecorator(IsEntityService, p),
    )
    for (const p of entityServices) {
      this.entityServicesByString.set(p.name, p)
      this.entityServicesByEntity.set(
        this.discovery.getMetadataByDecorator(IsEntityService, p) as Function,
        p,
      )
    }
  }
}
