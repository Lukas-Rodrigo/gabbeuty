import { Injectable, Logger } from '@nestjs/common';
import { HashProvider } from '../../domain/providers/hash.provider';
import { UserRepository } from '../../../../_shared/repositories/user.repository';
import { Either, left, right } from '@/_shared/either';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export type RegisterOutput = Either<
  ResourceNotFoundError,
  {
    id: string;
    email: string;
  }
>;

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
  ) {}

  async execute({
    name,
    email,
    password,
  }: RegisterInput): Promise<RegisterOutput> {
    this.logger.log(`Attempting to create user with email: ${email}`);

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      this.logger.warn(
        `User registration failed: email already exists - ${email}`,
      );
      return left(
        new NotBelongsError({
          msg: 'E-mail existing error.',
        }),
      );
    }
    const passwordHash = await this.hashProvider.hash(password);

    const user = await this.userRepository.create(name, email, passwordHash);
    this.logger.log(`User created successfully: ${user.id.toValue()}`);

    return right({
      id: user.id.toValue(),
      email: user.email,
    });
  }
}
