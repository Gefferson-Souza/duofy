import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'API de Gerenciamento de Pedidos - Duofy';
  }

  getApiInfo(): any {
    return {
      name: 'Sistema de Gerenciamento de Pedidos',
      version: '1.0.0',
      description:
        'API RESTful para gerenciamento e processamento assíncrono de pedidos',
      endpoints: {
        orders: '/api/orders',
        auth: '/api/auth',
      },
    };
  }
}
