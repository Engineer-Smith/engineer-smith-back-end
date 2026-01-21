// src/admin/dto/admin.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for user dashboard query filters
 */
export class UserDashboardQueryDto {
  @IsOptional()
  @IsMongoId()
  orgId?: string;

  @IsOptional()
  @IsEnum(['admin', 'instructor', 'student'])
  role?: string;

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
  @Max(100)
  limit?: number = 20;
}

/**
 * DTO for granting additional attempts
 */
export class GrantAttemptsDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  testId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  extraAttempts: number;

  @IsString()
  reason: string;
}

/**
 * DTO for updating an override
 */
export class UpdateOverrideDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  extraAttempts: number;

  @IsString()
  reason: string;
}

/**
 * DTO for override query filters
 */
export class OverrideQueryDto {
  @IsOptional()
  @IsMongoId()
  testId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;
}

/**
 * Response DTOs
 */
export class RoleDistributionDto {
  admin: number;
  instructor: number;
  student: number;
}

export class AccountTypesDto {
  sso: number;
  regular: number;
}

export class PerformanceOverviewDto {
  totalTestsTaken: number;
  averageScore: number;
  passRate: number;
  totalTimeSpent: number;
}

export class DashboardOverviewDto {
  totalUsers: number;
  roleDistribution: RoleDistributionDto;
  accountTypes: AccountTypesDto;
  performance: PerformanceOverviewDto | null;
}

export class PaginationDto {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export class UserListItemDto {
  _id: string;
  loginId: string;
  fullName: string;
  email?: string;
  role: string;
  isSSO: boolean;
  organizationName?: string;
  createdAt: Date;
}

export class RecentActivityDto {
  newUsersLast30Days: { _id: string; count: number }[];
  registrationTrend: number;
}

export class ContentCreatorDto {
  creatorId: string;
  creatorName: string;
  creatorRole: string;
  questionCount?: number;
  testCount?: number;
}

export class ContentStatsDto {
  topQuestionCreators: ContentCreatorDto[];
  topTestCreators: ContentCreatorDto[];
}

export class OrganizationStatsDto {
  _id: string;
  name: string;
  isSuperOrg: boolean;
  userCount: number;
  adminCount: number;
  instructorCount: number;
  studentCount: number;
}

export class UserDashboardResponseDto {
  overview: DashboardOverviewDto;
  recentActivity: RecentActivityDto;
  users: {
    list: UserListItemDto[];
    pagination: PaginationDto;
  };
  content: ContentStatsDto;
  organizations?: OrganizationStatsDto[];
}

export class AttemptStatusResponseDto {
  student: {
    id: string;
    name: string;
    email: string;
  };
  test: {
    id: string;
    title: string;
    baseAttempts: number;
  };
  attempts: {
    total: number;
    used: number;
    remaining: number;
  };
  override: {
    extraAttempts: number;
    reason: string;
    grantedBy: string;
    grantedAt: Date;
  } | null;
}