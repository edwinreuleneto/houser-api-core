import * as dotenv from 'dotenv';
dotenv.config();

// Dependencies
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Modules
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware de segurança
  app.use(helmet());

  // Lista branca de domínios permitidos (separados por vírgula)
  const whitelist = (process.env.CORS_WHITELIST ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Configuração do CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('🩶 Donna - Core')
    .setDescription('API Houser Core')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
