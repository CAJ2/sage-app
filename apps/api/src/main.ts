import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      bodyParser: false,
      cors: {
        origin: [
          'https://sageleaf.app',
          'https://dev.sageleaf.app',
          'http://localhost:3000',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
      },
    },
  )
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          frameSrc: ["'self'", 'sandbox.embed.apollographql.com'],
          imgSrc: [
            "'self'",
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          manifestSrc: [
            "'self'",
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: ["'self'", "https: 'unsafe-inline'"],
        },
      },
      crossOriginOpenerPolicy: {
        policy: 'same-origin',
      },
      crossOriginResourcePolicy: {
        policy: 'same-site',
      },
      crossOriginEmbedderPolicy: false,
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  app.enableShutdownHooks()
  await app.listen(process.env.PORT || 4444)
}
bootstrap()
