import { Either, left, right } from '@/_shared/either';
import { AlreadyExists } from '@/_shared/errors/already-exists.error';
import { UniqueEntityID } from '@/_shared/entities/value-objects/unique-entity-id.vo';
import { Client } from '@/modules/gabbeuty-crm/domain/entities/client.entity';
import { ClientsRepository } from '@/modules/gabbeuty-crm/domain/repositories/clients.repository';
import { Injectable } from '@nestjs/common';

export interface CreateClientRequest {
  name: string;
  phoneNumber: string;
  profileUrl?: string;
  observation?: string;
  professionalId: string;
}

type CreateClientResponse = Either<AlreadyExists, null>;

@Injectable()
export class CreateClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}
  async execute({
    name,
    phoneNumber,
    observation,
    professionalId,
    profileUrl,
  }: CreateClientRequest): Promise<CreateClientResponse> {
    // todo => procurar os clients pelo professional id e verificar se existe um client com mesmo nome e phone number.
    const clientFound =
      await this.clientsRepository.findByPhoneNumber(phoneNumber);

    if (clientFound && name === clientFound.name) {
      return left(new AlreadyExists({ msg: 'Client already exists.' }));
    }
    const newClient = Client.create({
      name,
      phoneNumber,
      observation,
      professionalId: new UniqueEntityID(professionalId),
      profileUrl,
    });
    await this.clientsRepository.create(newClient);
    return right(null);
  }
}
