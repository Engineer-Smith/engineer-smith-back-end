import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  ValidateNested,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// Supported runtimes for code execution
export enum Runtime {
  NODE = 'node',
  PYTHON = 'python',
  SQL = 'sql',
  DART = 'dart',
}

// Supported languages (superset of runtimes - includes UI frameworks)
export enum Language {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  SQL = 'sql',
  DART = 'dart',
  SWIFT = 'swift',
  SWIFTUI = 'swiftui',
  REACT = 'react',
  REACT_NATIVE = 'reactNative',
  FLUTTER = 'flutter',
  EXPRESS = 'express',
  HTML = 'html',
  CSS = 'css',
  JSON = 'json',
}

// Test case structure
export class TestCaseDto {
  @IsArray()
  args: any[];

  // Expected can be any type - string, number, array, object, etc.
  expected: any;

  @IsBoolean()
  hidden: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  // SQL-specific fields
  @IsOptional()
  @IsString()
  schemaSql?: string;

  @IsOptional()
  @IsString()
  seedSql?: string;

  @IsOptional()
  expectedRows?: any[];

  @IsOptional()
  @IsBoolean()
  orderMatters?: boolean;
}

// Main DTO for running code tests
export class RunCodeTestsDto {
  @IsString()
  code: string;

  @IsEnum(Language)
  language: Language;

  @IsEnum(Runtime)
  runtime: Runtime;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases: TestCaseDto[];

  @IsOptional()
  @IsString()
  entryFunction?: string;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  timeoutMs?: number = 3000;
}
