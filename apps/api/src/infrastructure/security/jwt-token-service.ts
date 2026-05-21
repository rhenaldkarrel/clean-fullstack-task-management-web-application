import jwt, { type SignOptions } from 'jsonwebtoken';
import type {
  AccessTokenPayload,
  TokenService,
} from '../../application/contracts/token-service.js';
import { env } from '../../shared/config/env.js';
import { AppError } from '../../shared/errors/app-error.js';

type JwtPayload = AccessTokenPayload & jwt.JwtPayload;

export class JwtTokenService implements TokenService {
  signAccessToken(payload: AccessTokenPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, env.JWT_SECRET, options);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      if (!decoded.userId || !decoded.email) {
        throw new AppError({
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: 'Invalid access token',
        });
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch {
      throw new AppError({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      });
    }
  }
}
