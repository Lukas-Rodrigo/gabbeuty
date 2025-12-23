import { User } from '@/modules/auth/domain/entities/user.entity';
import { UserRepository } from '@/_shared/repositories/user.repository';

export class InMemoryUserRepository implements UserRepository {
  public users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    return user ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id.toValue() === id);
    return user ?? null;
  }

  async create(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<User> {
    const user = User.create({
      name,
      email,
      password: passwordHash,
    });

    this.users.push(user);
    return user;
  }
}
