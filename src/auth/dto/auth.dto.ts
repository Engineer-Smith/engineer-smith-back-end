import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores, and hyphens',
  })
  username: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  inviteCode?: string;

  @IsOptional()
  @IsEnum(['admin', 'instructor', 'student'])
  role?: 'admin' | 'instructor' | 'student';
}

export class LoginDto {
  @IsString()
  loginCredential: string; // Can be username or email

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  refreshToken?: string; // Optional - can come from cookie
}

export class ValidateInviteDto {
  @IsString()
  inviteCode: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
