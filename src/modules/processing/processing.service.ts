import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
// import { LogsService } from '../logs/logs.service';

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    // private readonly logsService: LogsService,
  ) {}

  async processOrder(orderId: string): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Iniciando processamento do pedido ${orderId}`);

    try {
      // Buscar o pedido
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error(`Pedido ${orderId} não encontrado`);
      }

      // Atualizar status para processando
      order.status = OrderStatus.PROCESSING;
      await this.orderRepository.save(order);

      // Registrar log de processamento iniciado
      // await this.logsService.createLog({
      //   orderId,
      //   action: 'PROCESSING_STARTED',
      //   data: { timestamp: new Date() },
      //   status: 'success',
      // });

      // Simular um processamento assíncrono (em produção, isso seria uma tarefa mais complexa)
      await this.simulateProcessing();

      // Atualizar status para concluído
      order.status = OrderStatus.COMPLETED;
      await this.orderRepository.save(order);

      // Calcular tempo de processamento
      const processingTime = Date.now() - startTime;

      // Registrar log de processamento concluído
      // await this.logsService.createLog({
      //   orderId,
      //   action: 'PROCESSING_COMPLETED',
      //   data: { timestamp: new Date() },
      //   status: 'success',
      //   processingTime,
      // });

      this.logger.log(
        `Processamento do pedido ${orderId} concluído em ${processingTime}ms`,
      );
    } catch (error: unknown) {
      // Em caso de erro, registrar log
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // await this.logsService.createLog({
      //   orderId,
      //   action: 'PROCESSING_ERROR',
      //   data: { error: errorMessage },
      //   status: 'error',
      //   errorMessage,
      // });

      this.logger.error(`Erro ao processar pedido ${orderId}: ${errorMessage}`);
      throw error;
    }
  }

  private async simulateProcessing(): Promise<void> {
    // Simular um processamento que leva tempo
    return new Promise<void>((resolve) => setTimeout(resolve, 2000));
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldPendingOrders(): Promise<void> {
    this.logger.log('Executando limpeza de pedidos pendentes antigos');

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const pendingOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.PENDING,
        createdAt: LessThan(oneHourAgo),
      },
    });

    this.logger.log(
      `Encontrados ${pendingOrders.length} pedidos pendentes antigos`,
    );

    for (const order of pendingOrders) {
      // Tentar processar novamente
      await this.processOrder(order.id);
    }
  }
}
