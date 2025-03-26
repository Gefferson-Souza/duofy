import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessingService } from './processing.service';
import { ProcessingController } from './processing.controller';
import { LogsModule } from '../logs/logs.module';
import { OrdersModule } from '../orders/orders.module';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ClientsModule.registerAsync([
      {
        name: 'PROCESSING_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>(
                'RABBITMQ_URL',
                'amqp://localhost:5672',
              ),
            ],
            queue: 'processing_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
    LogsModule,
    OrdersModule,
  ],
  controllers: [ProcessingController],
  providers: [ProcessingService],
})
export class ProcessingModule {}
