import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./http-exception.filter";
import { BaseWsExceptionFilter } from "@nestjs/websockets";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3100);
}

bootstrap();
