import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', // Allow only frontend origin
    methods: ['POST','GET','PATCH','DELETE'], // Allow only POST requests
    allowedHeaders: ['Content-Type'], // Allow content-type headers
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
