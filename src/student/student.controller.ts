// src/student/student.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('student')
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  /**
   * GET /student/dashboard
   * Get student dashboard with stats, available tests, recent activity, etc.
   * Access: All authenticated users (primarily students)
   */
  @Get('dashboard')
  @Roles('student', 'instructor', 'admin')
  async getDashboard(@CurrentUser() user: RequestUser) {
    return this.studentService.getDashboard(user);
  }
}