import { Injectable } from '@nestjs/common';
import { HashProvider } from '../../domain/providers/hash.provider';

import bcrypt from 'bcrypt';

@Injectable()
export class BcryptHashProvider implements HashProvider {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
