import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { LogsService } from '../logs/logs.service';
import { DailyReportDto, DateRangeReportDto } from './reports.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly logsService: LogsService,
  ) {}

  async generateDailyReport(date?: Date): Promise<DailyReportDto> {
    const reportDate = date || new Date();
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    this.logger.log(
      `Gerando relatório diário para ${startOfDay.toISOString().split('T')[0]}`,
    );

    // Buscar pedidos do dia
    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    // Calcular métricas
    const totalOrders = orders.length;
    const totalAmount = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount.toString()),
      0,
    );
    const ordersByStatus = this.countOrdersByStatus(orders);
    const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    // Montar o relatório
    const report: DailyReportDto = {
      date: startOfDay.toISOString().split('T')[0],
      totalOrders,
      totalAmount,
      averageOrderValue,
      ordersByStatus,
    };

    // Registrar log de geração de relatório
    await this.logsService.createLog({
      orderId: 'system',
      action: 'REPORT_GENERATED',
      data: { report },
      status: 'success',
    });

    return report;
  }

  async generateDateRangeReport(
    startDate: Date,
    endDate: Date,
  ): Promise<DateRangeReportDto> {
    this.logger.log(
      `Gerando relatório para o período de ${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}`,
    );

    // Ajustar horários para incluir todo o período
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    // Buscar pedidos do período
    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDateTime, endDateTime),
      },
    });

    // Calcular métricas
    const totalOrders = orders.length;
    const totalAmount = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount.toString()),
      0,
    );
    const ordersByStatus = this.countOrdersByStatus(orders);
    const ordersByDay = this.groupOrdersByDay(orders);
    const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    // Montar o relatório
    const report: DateRangeReportDto = {
      date: new Date().toISOString().split('T')[0], // Data atual do relatório
      startDate: startDateTime.toISOString().split('T')[0],
      endDate: endDateTime.toISOString().split('T')[0],
      totalOrders,
      totalAmount,
      averageOrderValue,
      ordersByStatus,
      ordersByDay,
    };

    // Registrar log de geração de relatório
    await this.logsService.createLog({
      orderId: 'system',
      action: 'REPORT_GENERATED',
      data: { report },
      status: 'success',
    });

    return report;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateAutomaticDailyReport(): Promise<void> {
    this.logger.log('Executando geração automática de relatório diário');

    // Pegar a data de ontem
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const report = await this.generateDailyReport(yesterday);
      this.logger.log(
        `Relatório diário gerado com sucesso: ${JSON.stringify(report)}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao gerar relatório diário: ${errorMessage}`);
    }
  }

  private countOrdersByStatus(orders: Order[]): Record<OrderStatus, number> {
    const counts: Record<OrderStatus, number> = {} as Record<
      OrderStatus,
      number
    >;

    Object.values(OrderStatus).forEach((status) => {
      counts[status] = 0;
    });

    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });

    return counts;
  }

  private groupOrdersByDay(
    orders: Order[],
  ): Record<string, { count: number; amount: number }> {
    const result: Record<string, { count: number; amount: number }> = {};

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];

      if (!result[dateKey]) {
        result[dateKey] = { count: 0, amount: 0 };
      }

      result[dateKey].count += 1;
      result[dateKey].amount += parseFloat(order.totalAmount.toString());
    });

    return result;
  }
}
