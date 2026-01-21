// src/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';
import {
  GetUsersQueryDto,
  UpdateUserDto,
  CreateUserDto,
} from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /users
   * Get all users with filters
   * Access: Admin, Instructor (own org only)
   */
  @Get()
  @Roles('admin', 'instructor')
  async getAllUsers(
    @Query() filters: GetUsersQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const [users, total] = await Promise.all([
      this.userService.getAllUsers(filters, user),
      this.userService.getUserCount(filters, user),
    ]);

    return {
      users,
      total,
      skip: filters.skip || 0,
      limit: filters.limit || 10,
    };
  }

  /**
   * GET /users/search
   * Search users by name (autocomplete)
   * Access: Admin, Instructor
   */
  @Get('search')
  @Roles('admin', 'instructor')
  async searchUsers(
    @Query('q') searchTerm: string,
    @Query('role') role: string,
    @Query('limit') limit: string,
    @CurrentUser() user: RequestUser,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.userService.searchUsers(searchTerm, user, role, parsedLimit);
  }

  /**
   * GET /users/:userId
   * Get a specific user by ID
   * Access: Admin, Instructor (own org), or self
   */
  @Get(':userId')
  @Roles('admin', 'instructor', 'student')
  async getUser(
    @Param('userId') userId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.userService.getUser(userId, user);
  }

  /**
   * POST /users
   * Create a new user
   * Access: Admin only
   */
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.userService.createUser(dto, user);
  }

  /**
   * PATCH /users/:userId
   * Update a user
   * Access: Admin only
   */
  @Patch(':userId')
  @Roles('admin')
  async updateUser(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.userService.updateUser(userId, dto, user);
  }

  /**
   * DELETE /users/:userId
   * Delete a user
   * Access: Admin only
   */
  @Delete(':userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('userId') userId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.userService.deleteUser(userId, user);
  }
}