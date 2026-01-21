// src/organization/dto/organization.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating an organization (super admin only)
 */
export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(4)
  @MaxLength(50)
  inviteCode: string;
}

/**
 * DTO for updating an organization
 */
export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  inviteCode?: string;
}

/**
 * DTO for listing organizations with pagination
 */
export class GetOrganizationsQueryDto {
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

  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * DTO for validating invite code
 */
export class ValidateInviteCodeDto {
  @IsString()
  @MinLength(4)
  inviteCode: string;
}

/**
 * Response DTO for organization data
 */
export class OrganizationResponseDto {
  _id: string;
  name: string;
  inviteCode: string;
  isSuperOrg: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response DTO for invite code validation
 */
export class InviteCodeValidationResponseDto {
  _id: string;
  name: string;
}