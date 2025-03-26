import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Página inicial da API' })
  @ApiResponse({ status: 200, description: 'Mensagem de boas-vindas' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('info')
  @ApiOperation({ summary: 'Informações sobre a API' })
  @ApiResponse({ status: 200, description: 'Retorna metadados da API' })
  getApiInfo(): any {
    return this.appService.getApiInfo();
  }
}
