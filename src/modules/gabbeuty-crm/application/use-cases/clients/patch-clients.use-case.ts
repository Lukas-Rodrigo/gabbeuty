import { Either, left, right } from '@/_shared/either';
import { AlreadyExists } from '@/_shared/errors/already-exists.error';
import { NotBelongsError } from '@/_shared/errors/not-belongs.error';
import { ResourceNotFoundError } from '@/_shared/errors/resource-not-found.error';
import { UserRepository } from '@/_shared/repositories/user.repository';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { ClientsRepository } from '@/modules/gabbeuty-crm/domain/repositories/clients.repository';
import { Injectable } from '@nestjs/common';

type PatchClientsUseCaseResponse = Either<
  AlreadyExists | ResourceNotFoundError | NotBelongsError,
  {
    client: Client;
  }
>;

export interface PatchClientsUseCaseRequest {
  professionalId: string;
  clientId: string;
  data: {
    name?: string;
    phoneNumber?: string;
    profileUrl?: string;
    observation?: string;
  };
}

@Injectable()
export class PatchClientsUseCase {
  constructor(
    private userRepository: UserRepository,
    private clientsRepository: ClientsRepository,
  ) {}
  async execute({
    professionalId,
    clientId,
    data,
  }: PatchClientsUseCaseRequest): Promise<PatchClientsUseCaseResponse> {
    const isValidProfessional =
      await this.userRepository.findById(professionalId);

    // Validate professional
    if (!isValidProfessional) {
      return left(
        new ResourceNotFoundError({ msg: 'Professional not found.' }),
      );
    }

    const isValidClient = await this.clientsRepository.findById(clientId);

    if (!isValidClient) {
      return left(new ResourceNotFoundError({ msg: 'Client not found.' }));
    }

    if (isValidClient.professionalId.toValue() !== professionalId) {
      return left(
        new NotBelongsError({ msg: 'Client does not belong to the user.' }),
      );
    }

    const { name, phoneNumber, observation, profileUrl } = data;

    if (name !== undefined) {
      isValidClient.updateName(name);
    }

    if (phoneNumber !== undefined) {
      // const isPhoneNumberExists =
      //   await this.clientsRepository.findByPhoneNumber(phoneNumber);
      // if (
      //   isPhoneNumberExists?.professionalId.toValue() === professionalId &&
      //   isPhoneNumberExists.id.toValue() === clientId &&
      //   isPhoneNumberExists.name === name
      // ) {
      //   return left(new AlreadyExists({ msg: 'Client already exists.' }));
      // }
      isValidClient.phoneNumber = phoneNumber;
    }

    if (observation !== undefined) {
      isValidClient.observation = observation;
    }

    if (profileUrl !== undefined) {
      isValidClient.profileUrl = profileUrl;
    }

    const client = await this.clientsRepository.save(clientId, isValidClient);

    return right({
      client: client,
    });
  }
}
