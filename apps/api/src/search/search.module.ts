import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AuthModule } from '@src/auth/auth.module'
import { ChangesModule } from '@src/changes/changes.module'
import { SearchResolver } from './search.resolver'
import { SearchService } from './search.service'

@Module({
  imports: [
    MikroOrmModule.forFeature([]),
    AuthModule.registerAsync(),
    ChangesModule,
  ],
  providers: [SearchResolver, SearchService],
})
export class SearchModule {}
