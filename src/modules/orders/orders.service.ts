import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
// import { LogsService } from '../logs/logs.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('ORDERS_SERVICE')
    private readonly orderClient: ClientProxy,
    // private readonly logsService: LogsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Calcular o valor total do pedido
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Criar e salvar o pedido
    const order = this.orderRepository.create({
      ...createOrderDto,
      totalAmount,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Registrar log de criação
    // await this.logsService.createLog({
    //   orderId: savedOrder.id,
    //   action: 'CREATE',
    //   data: savedOrder,
    //   status: 'success',
    // });

    // Publicar evento para processamento assíncrono
    this.orderClient.emit('order_created', {
      id: savedOrder.id,
      items: savedOrder.items,
    });

    return savedOrder;
  }

  async findAll(options: { page: number; limit: number }) {
    const [items, total] = await this.orderRepository.findAndCount({
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: options.limit,
        totalPages: Math.ceil(total / options.limit),
        currentPage: options.page,
      },
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    return order;
  }
}
