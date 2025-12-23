import { mapDomainErrorToHttpException } from '@/_shared/filters/map-domain-error';
import { CurrentUser } from '@/modules/auth/infra/jwt/current-user.decorator';
import { CreateClientUseCase } from '@/modules/gabbeuty-crm/application/use-cases/clients/create-client.use-case';
import { DeleteClientsUseCase } from '@/modules/gabbeuty-crm/application/use-cases/clients/delete-clients.use-case';
import { FetchClientsUseCase } from '@/modules/gabbeuty-crm/application/use-cases/clients/fetch-clients.use-case';
import { PatchClientsUseCase } from '@/modules/gabbeuty-crm/application/use-cases/clients/patch-clients.use-case';
import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { UUIDParamDto } from '../dto/uuid-param.dto';
import { CreateClientDto } from '../dto/create-client.dto';
import { FetchClientsQueriesDto } from '../dto/fetch-clients-queries.dto';
import { PatchClientDto } from '../dto/patch-clients.dto';
import { ClientsApiDoc } from '@/_shared/docs/swagger.decorators';
import { ClientPresenter } from '../presenters/client-presenter';

@Controller('clients')
export class ClientsController {
  constructor(
    private createClientsUseCase: CreateClientUseCase,
    private patchClientsUseCase: PatchClientsUseCase,
    private fetchClientsUseCase: FetchClientsUseCase,
    private deleteClientsUseCase: DeleteClientsUseCase,
  ) {}

  @ClientsApiDoc.Create()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() userPayload, @Body() body: CreateClientDto) {
    const { name, phoneNumber, observation, profileUrl } = body;
    const professionalId = userPayload.sub;
    const result = await this.createClientsUseCase.execute({
      name,
      phoneNumber,
      professionalId,
      observation,
      profileUrl,
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }

    const { client } = result.value;

    return ClientPresenter.toHTTP(client);
  }

  @ClientsApiDoc.Update()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async patch(
    @CurrentUser() user,
    @Body() body: PatchClientDto,
    @Param() { id: clientId }: UUIDParamDto,
  ) {
    const { name, phoneNumber, observation, profileUrl } = body;

    const result = await this.patchClientsUseCase.execute({
      professionalId: user.sub,
      clientId,
      data: {
        name,
        phoneNumber,
        observation,
        profileUrl,
      },
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }
    const { client } = result.value;
    return ClientPresenter.toHTTP(client);
  }

  @ClientsApiDoc.Fetch()
  @Get()
  async fetch(@CurrentUser() user, @Query() queries: FetchClientsQueriesDto) {
    const { sub: professionalId } = user;
    const { page, perPage, startDate, endDate } = queries;

    const result = await this.fetchClientsUseCase.handle({
      professionalId,
      dateRange: {
        endDate,
        startDate,
      },
      pagination: {
        perPage,
        page,
      },
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }

    const { clients } = result.value;
    return ClientPresenter.toFetchHTTP({
      clients,
      dateRange: {
        endDate,
        startDate,
      },
      pagination: {
        perPage,
        page,
      },
    });
  }

  @ClientsApiDoc.Delete()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@CurrentUser() user, @Param() { id: clientId }: UUIDParamDto) {
    const result = await this.deleteClientsUseCase.handle({
      professionalId: user.sub,
      clientId,
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }
  }
}
