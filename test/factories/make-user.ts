import { faker } from '@faker-js/faker';
import { User } from '@/modules/auth/domain/entities/user.entity';

export function makeUser(override?: Partial<User>) {
  const user = User.create({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...override,
  });

  return user;
}
