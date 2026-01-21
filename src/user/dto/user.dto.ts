// src/user/dto/user.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

// Valid roles
export type UserRole = 'admin' | 'instructor' | 'student';

/**
 * DTO for getting all users with filters
 */
export class GetUsersQueryDto {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsEnum(['admin', 'instructor', 'student'])
  role?: UserRole;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

/**
 * DTO for updating a user
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'loginId can only contain letters, numbers, and underscores',
  })
  loginId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password?: string;

  @IsOptional()
  @IsEnum(['admin', 'instructor', 'student'])
  role?: UserRole;
}

/**
 * DTO for creating a user (admin creating users)
 */
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'loginId can only contain letters, numbers, and underscores',
  })
  loginId: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsEnum(['admin', 'instructor', 'student'])
  role?: UserRole = 'student';
}

/**
 * Response DTO for user data (excludes sensitive fields)
 */
export class UserResponseDto {
  _id: string;
  loginId: string;
  email?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  organizationId: string;
  role: UserRole;
  isSSO: boolean;
  createdAt: Date;
  updatedAt: Date;
}