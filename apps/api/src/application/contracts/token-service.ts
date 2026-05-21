export type AccessTokenPayload = {
  userId: string;
  email: string;
};

export interface TokenService {
  signAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload;
}
