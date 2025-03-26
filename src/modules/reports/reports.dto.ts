import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../orders/entities/order.entity';

export class OrderStatusCount {
  @ApiProperty({ example: 1 })
  [OrderStatus.PENDING]: number;

  @ApiProperty({ example: 2 })
  [OrderStatus.PROCESSING]: number;

  @ApiProperty({ example: 5 })
  [OrderStatus.COMPLETED]: number;

  @ApiProperty({ example: 0 })
  [OrderStatus.CANCELLED]: number;
}

export class DailyOrderStats {
  @ApiProperty({ example: 3 })
  count: number;

  @ApiProperty({ example: 299.97 })
  amount: number;
}

// Corrigido: Removido o decorator e alterado para um tipo ao invés de uma classe
// O Swagger vai utilizar o exemplo fornecido abaixo para documentação
export type DailyOrdersMap = Record<string, DailyOrderStats>;

export class DailyReportDto {
  @ApiProperty({ example: '2025-03-24' })
  date: string;

  @ApiProperty({ example: 8 })
  totalOrders: number;

  @ApiProperty({ example: 799.92 })
  totalAmount: number;

  @ApiProperty({ example: 99.99 })
  averageOrderValue: number;

  @ApiProperty({ type: OrderStatusCount })
  ordersByStatus: OrderStatusCount;
}

export class DateRangeReportDto extends DailyReportDto {
  @ApiProperty({ example: '2025-03-20' })
  startDate: string;

  @ApiProperty({ example: '2025-03-24' })
  endDate: string;

  @ApiProperty({
    example: {
      '2025-03-20': { count: 3, amount: 299.97 },
      '2025-03-21': { count: 5, amount: 499.95 },
    },
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 3 },
        amount: { type: 'number', example: 299.97 },
      },
    },
  })
  ordersByDay: DailyOrdersMap;
}
