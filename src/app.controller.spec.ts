import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return welcome message', () => {
      const result = 'API de Gerenciamento de Pedidos - Duofy';
      jest.spyOn(appService, 'getHello').mockImplementation(() => result);
      expect(appController.getHello()).toBe(result);
    });
  });

  describe('info', () => {
    it('should return API info', () => {
      const result = {
        name: 'Sistema de Gerenciamento de Pedidos',
        version: '1.0.0',
        description:
          'API RESTful para gerenciamento e processamento assíncrono de pedidos',
        endpoints: {
          orders: '/api/orders',
          auth: '/api/auth',
        },
      };
      jest.spyOn(appService, 'getApiInfo').mockImplementation(() => result);
      expect(appController.getApiInfo()).toBe(result);
    });
  });
});
