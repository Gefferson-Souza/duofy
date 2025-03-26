import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração de prefixo global para API
  app.setGlobalPrefix('api');

  // Configuração de validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Habilitar CORS
  app.enableCors();

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Gerenciamento de Pedidos')
    .setDescription(
      'Sistema de gerenciamento e processamento assíncrono de pedidos',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Obter a configuração de porta
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`Aplicação rodando na porta ${port}`);
}

// Corrigido: Promise não tratada
void bootstrap().catch((err) => {
  console.error('Erro ao iniciar a aplicação:', err);
  process.exit(1);
});
