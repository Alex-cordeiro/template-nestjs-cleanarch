import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';

@ApiTags('Health')
@Controller('api/health')
export class HealthController {
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'API is running',
    schema: {
      example: { status: 'ok', timestamp: '2024-01-01T00:00:00Z' },
    },
  })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
