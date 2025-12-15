import { Either, left, right } from '@/_shared/either';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { ClientsRepository } from '@/modules/gabbeuty-crm/domain/repositories/clients.repository';
import { Injectable } from '@nestjs/common';

export interface DeleteClientRequest {
  clientId: string;
  professionalId: string;
}

type DeleteClientResponse = Either<
  ResourceNotFoundError | NotBelongsError,
  null
>;

@Injectable()
export class DeleteClientsUseCase {
  constructor(
    private clientsRepository: ClientsRepository,
    private userRepository: UserRepository,
  ) {}
  async handle({
    clientId,
    professionalId,
  }: DeleteClientRequest): Promise<DeleteClientResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({ msg: 'Professional not found.' }),
      );
    }
    const isValidClient = await this.clientsRepository.findById(clientId);

    if (!isValidClient) {
      return left(new ResourceNotFoundError({ msg: 'Client not found.' }));
    }

    if (
      isValidClient?.professionalId.toValue() !==
      isValidProfessional.id.toValue()
    ) {
      return left(
        new NotBelongsError({ msg: 'Client does not belong to the user.' }),
      );
    }

    if (isValidClient.deletedAt) {
      return right(null);
    }

    await this.clientsRepository.delete(clientId);
    return right(null);
  }
}
