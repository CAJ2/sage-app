import config from '@config/config'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { nanoid } from 'nanoid'
import { ClsModule } from 'nestjs-cls'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { DB } from './db.service'
import { GeoModule } from './geo/geo.module'
import { GraphQLModule } from './graphql/graphql.module'
import { ProcessModule } from './process/process.module'
import { ProductModule } from './product/product.module'
import { UsersModule } from './users/users.module'

@Module({
  controllers: [AppController],
  exports: [DB],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => {
          const existingId = req.headers.get('X-Request-Id')
          if (Array.isArray(existingId) || !existingId) {
            return nanoid()
          }
          return existingId
        },
      },
    }),
    GraphQLModule.register(),
    AuthModule,
    UsersModule,
    GeoModule,
    ProductModule,
    ProcessModule,
  ],
  providers: [AppService, DB],
})
export class AppModule {}
