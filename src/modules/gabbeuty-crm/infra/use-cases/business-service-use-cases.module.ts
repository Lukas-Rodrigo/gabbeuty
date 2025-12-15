import { Module } from '@nestjs/common';
import { CreateBusinessServicesUseCase } from '../../application/use-cases/business-service/create-business-services.use-case';
import { DeleteBusinessServicesUseCase } from '../../application/use-cases/business-service/delete-business-services.use-case';
import { FetchBusinessServicesUseCase } from '../../application/use-cases/business-service/fetch-business-services.use-case';
import { PatchBusinessServicesUseCase } from '../../application/use-cases/business-service/patch-business-services.use-case';
import { CrmDatabaseModule } from '../database/@database.module';

@Module({
  imports: [CrmDatabaseModule],
  providers: [
    CreateBusinessServicesUseCase,
    FetchBusinessServicesUseCase,
    PatchBusinessServicesUseCase,
    DeleteBusinessServicesUseCase,
  ],
  exports: [
    CreateBusinessServicesUseCase,
    FetchBusinessServicesUseCase,
    PatchBusinessServicesUseCase,
    DeleteBusinessServicesUseCase,
  ],
})
export class BusinessServiceUseCaseModule {}
