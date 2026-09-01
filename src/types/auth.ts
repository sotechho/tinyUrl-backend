export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface GenerateAccessAndRefreshToken {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  role: string;
}
