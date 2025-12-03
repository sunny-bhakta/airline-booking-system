import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Swagger/OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('Airline Booking System API')
    .setDescription('Flight Management API for airline booking system')
    .setVersion('1.0')
    .addTag('flights', 'Flight management endpoints')
    .addTag('app', 'Application endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('Flight Management API available at: http://localhost:3000/flights');
  console.log('Swagger API Documentation available at: http://localhost:3000/api');
}
bootstrap();

