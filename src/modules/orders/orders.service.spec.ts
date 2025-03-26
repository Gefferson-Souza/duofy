import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { LogsService } from '../logs/logs.service';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';

const mockOrder: Order = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  items: [{ name: 'Product 1', quantity: 2, price: 100 }],
  totalAmount: 200,
  status: OrderStatus.PENDING,
  notes: 'Delivery instructions',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Order>;
  let logsService: LogsService;
  let orderClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn().mockReturnValue(mockOrder),
            save: jest.fn().mockResolvedValue(mockOrder),
            findAndCount: jest.fn().mockResolvedValue([[mockOrder], 1]),
            findOne: jest.fn().mockResolvedValue(mockOrder),
          },
        },
        {
          provide: LogsService,
          useValue: {
            createLog: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: 'ORDERS_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
    logsService = module.get<LogsService>(LogsService);
    orderClient = module.get<ClientProxy>('ORDERS_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createSpy = jest.spyOn(repository, 'create');
      const saveSpy = jest.spyOn(repository, 'save');
      const createLogSpy = jest.spyOn(logsService, 'createLog');
      const emitSpy = jest.spyOn(orderClient, 'emit');

      const createOrderDto: CreateOrderDto = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        items: [{ name: 'Product 1', quantity: 2, price: 100 } as OrderItemDto],
        notes: 'Delivery instructions',
      };

      const result = await service.create(createOrderDto);

      expect(createSpy).toHaveBeenCalledWith({
        ...createOrderDto,
        totalAmount: 200,
        status: OrderStatus.PENDING,
      });
      expect(saveSpy).toHaveBeenCalled();
      expect(createLogSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('order_created', {
        id: mockOrder.id,
        items: mockOrder.items,
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const findAndCountSpy = jest.spyOn(repository, 'findAndCount');
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(findAndCountSpy).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        items: [mockOrder],
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should find an order by id', async () => {
      const findOneSpy = jest.spyOn(repository, 'findOne');
      const result = await service.findOne('123');

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.findOne('123')).rejects.toThrow();
    });
  });
});
