import { TokenProvider } from '@/modules/auth/domain/providers/token.provider';

export class FakeEncrypter implements TokenProvider {
  async generateAccessToken(payload: {
    sub: string;
    email: string;
  }): Promise<string> {
    return `token_${payload.sub}_${payload.email}`;
  }

  generateRefreshToken(): string {
    return `refresh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  async verifyAccessToken(
    token: string,
  ): Promise<{ sub: string; email: string }> {
    const [, sub, email] = token.split('_');
    return { sub, email };
  }
}
