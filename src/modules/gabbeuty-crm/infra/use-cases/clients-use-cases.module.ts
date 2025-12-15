import { Module } from '@nestjs/common';
import { CrmDatabaseModule } from '../database/@database.module';
import { CreateClientUseCase } from '../../application/use-cases/clients/create-client.use-case';
import { PatchClientsUseCase } from '../../application/use-cases/clients/patch-clients.use-case';
import { FetchClientsUseCase } from '../../application/use-cases/clients/fetch-clients.use-case';
import { DeleteClientsUseCase } from '../../application/use-cases/clients/delete-clients.use-case';

@Module({
  imports: [CrmDatabaseModule],
  providers: [
    CreateClientUseCase,
    PatchClientsUseCase,
    FetchClientsUseCase,
    DeleteClientsUseCase,
  ],
  exports: [
    CreateClientUseCase,
    PatchClientsUseCase,
    FetchClientsUseCase,
    DeleteClientsUseCase,
  ],
})
export class ClientsUseCaseModule {}
