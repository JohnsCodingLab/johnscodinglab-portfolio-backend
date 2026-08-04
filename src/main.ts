import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { Logger } from 'nestjs-pino';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  // Global prefix — all routes start with /api
  app.setGlobalPrefix('api');

  // Cookie parser — reads httpOnly cookies
  app.use(cookieParser());

  // Validation — auto-validates DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter — consistent error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response interceptor — wraps in { success: true, data: ... }
  app.useGlobalInterceptors(new ResponseInterceptor());

  // CORS — allow your admin frontend (configure via CORS_ORIGIN env var)
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('JohnsCodingLab Portfolio API')
    .setDescription('Backend API for portfolio, blog, and admin panel')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`🚀 Server running on port ${process.env.PORT}`);
  console.log(
    `📚 Swagger docs at http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}
bootstrap().catch((err) => {
  console.error('FATAL bootstrap error:', err);
  process.exit(1);
});
bootstrap();
