import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProcessingModule } from './modules/processing/processing.module';
// import { LogsModule } from './modules/logs/logs.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    // Configuração através de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexão com PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize:
          configService.get('NODE_ENV', 'development') !== 'production',
        retryAttempts: 10,
        retryDelay: 3000,
        autoLoadEntities: true,
        keepConnectionAlive: true,
        logging: configService.get('NODE_ENV', 'development') !== 'production',
      }),
    }),

    // Conexão com MongoDB - Removidas opções obsoletas
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.10',
        ),
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),

    // Módulo de agendamento de tarefas
    ScheduleModule.forRoot(),

    // Módulos da aplicação
    AuthModule,
    OrdersModule,
    ProcessingModule,
    // LogsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
