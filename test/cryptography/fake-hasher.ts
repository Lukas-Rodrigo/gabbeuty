import { HashProvider } from '@/modules/auth/domain/providers/hash.provider';

export class FakeHasher implements HashProvider {
  async hash(plain: string): Promise<string> {
    return `hashed_${plain}`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return `hashed_${plain}` === hash;
  }
}
