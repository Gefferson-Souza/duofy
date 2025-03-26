import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProcessingService } from './processing.service';

@ApiTags('processing')
@Controller('processing')
export class ProcessingController {
  constructor(private readonly processingService: ProcessingService) {}

  @Post(':id/process')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Processar um pedido manualmente' })
  @ApiResponse({ status: 200, description: 'Pedido processado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async processOrder(@Param('id') id: string) {
    await this.processingService.processOrder(id);
    return { message: 'Pedido enviado para processamento' };
  }

  @MessagePattern('order_created')
  async handleOrderCreated(@Payload() data: { id: string }) {
    await this.processingService.processOrder(data.id);
  }
}
