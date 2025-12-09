export interface TokenPayload {
  sub: string;
  email: string;
}

export abstract class TokenProvider {
  abstract generateAccessToken(payload: TokenPayload): Promise<string>;
  abstract generateRefreshToken(): string;
  abstract verifyAccessToken(token: string): Promise<TokenPayload>;
}
