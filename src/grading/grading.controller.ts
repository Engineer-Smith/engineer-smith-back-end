import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CodeExecutionService } from './code-execution.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminOnly } from '../auth/decorators/roles.decorator';

@Controller('grading')
export class GradingController {
  constructor(private readonly codeExecutionService: CodeExecutionService) {}

  /**
   * Get lightweight queue status (for dashboard polling)
   * Available to any authenticated user
   */
  @Get('queue/status')
  @UseGuards(JwtAuthGuard)
  getQueueStatus() {
    return this.codeExecutionService.getStatus();
  }

  /**
   * Get full queue metrics (admin only)
   */
  @Get('queue/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  getQueueMetrics() {
    return this.codeExecutionService.getMetrics();
  }

  /**
   * Reset queue metrics (admin only)
   */
  @Post('queue/reset-metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  resetMetrics() {
    return this.codeExecutionService.resetMetrics();
  }
}
