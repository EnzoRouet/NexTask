import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // TODO : Faire attention a ca, ca ne passe pas en prod dutout
  app.enableCors();
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap().catch(console.error);
