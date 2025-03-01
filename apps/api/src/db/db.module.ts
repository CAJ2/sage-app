import { LoadStrategy } from '@mikro-orm/core'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import mikroOrmConfig from '@src/mikro-orm.config'
import { ClsService } from 'nestjs-cls'

@Module({})
export class DBModule {
  static register (): DynamicModule {
    const mikroORM = MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ClsService],
      useFactory: (clsService: ClsService) => {
        return {
          ...mikroOrmConfig,
          autoLoadEntities: true,
          loadStrategy: LoadStrategy.JOINED,
        }
      },
    })

    return {
      module: DBModule,
      imports: [mikroORM],
      providers: [],
      exports: [mikroORM as DynamicModule],
    }
  }
}
