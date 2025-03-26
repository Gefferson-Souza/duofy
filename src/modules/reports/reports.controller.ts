import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { DailyReportDto, DateRangeReportDto } from './reports.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar relatório diário' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Data no formato YYYY-MM-DD',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório gerado com sucesso',
    type: DailyReportDto,
  })
  async generateDailyReport(
    @Query('date') dateString?: string,
  ): Promise<DailyReportDto> {
    let date: Date;

    if (dateString) {
      date = new Date(dateString);
    } else {
      date = new Date();
    }

    return this.reportsService.generateDailyReport(date);
  }

  @Get('range')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar relatório para um período' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Data inicial no formato YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'Data final no formato YYYY-MM-DD',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório gerado com sucesso',
    type: DateRangeReportDto,
  })
  async generateDateRangeReport(
    @Query('startDate') startDateString: string,
    @Query('endDate') endDateString: string,
  ): Promise<DateRangeReportDto> {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    return this.reportsService.generateDateRangeReport(startDate, endDate);
  }
}
