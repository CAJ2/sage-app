import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }))
  app.use(helmet({
    contentSecurityPolicy: {
     directives: {
       defaultSrc: [`'self'`, 'unpkg.com'],
       fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
       frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
       imgSrc: [`'self'`, 'data:', 'apollo-server-landing-page.cdn.apollographql.com'],
       manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
       scriptSrc: [`'self'`, `https: 'unsafe-inline'`, 'studio-ui-deployments.apollographql.com'],
     },
   },
  }));
  await app.listen(process.env.PORT || 4444);
}
void bootstrap();
