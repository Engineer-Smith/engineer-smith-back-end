export class UserResponseDto {
  _id: string;
  loginId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  organizationId: string;
  role: 'admin' | 'instructor' | 'student';
  isSSO?: boolean;
  organization?: {
    _id: string;
    name: string;
    isSuperOrg: boolean;
  };
  createdAt?: Date;
}

export class AuthResponseDto {
  success: boolean;
  user: UserResponseDto;
  csrfToken: string;
}

export class RefreshResponseDto {
  success: boolean;
  csrfToken: string;
}

export class LogoutResponseDto {
  success: boolean;
  message: string;
}

export class ValidateInviteResponseDto {
  success: boolean;
  organization: {
    _id: string;
    name: string;
  };
}

export class AuthStatusResponseDto {
  success: boolean;
  authenticated: boolean;
  user: {
    _id: string;
    role: string;
    organizationId: string;
  };
}

export class SocketTokenResponseDto {
  success: boolean;
  socketToken: string;
}
