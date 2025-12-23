import { CurrentUser } from '@/modules/auth/infra/jwt/current-user.decorator';
import { CreateBusinessServicesUseCase } from '@/modules/gabbeuty-crm/application/use-cases/business-service/create-business-services.use-case';
import { DeleteBusinessServicesUseCase } from '@/modules/gabbeuty-crm/application/use-cases/business-service/delete-business-services.use-case';
import { FetchBusinessServicesUseCase } from '@/modules/gabbeuty-crm/application/use-cases/business-service/fetch-business-services.use-case';
import { PatchBusinessServicesUseCase } from '@/modules/gabbeuty-crm/application/use-cases/business-service/patch-business-services.use-case';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateBusinessServicesDto } from '../dto/create-business-services.dto';
import { mapDomainErrorToHttpException } from '@/_shared/filters/map-domain-error';
import { UUIDParamDto } from '../dto/uuid-param.dto';
import { PatchBusinessServicesBodyDto } from '../dto/patch-business-services-body-.dto';
import { FiltersFetchQueriesDto } from '../dto/filters-fetch-queries.dto';
import { BusinessServicesApiDoc } from '@/_shared/docs/swagger.decorators';
import { ApiTags } from '@nestjs/swagger';
import { BusinessServicePresenter } from '../presenters/business-service.presenter';

@ApiTags('Business Services')
@Controller('business-services')
export class BusinessServicesController {
  constructor(
    private createBusinessServiceUseCase: CreateBusinessServicesUseCase,
    private patchBusinessServiceUseCase: PatchBusinessServicesUseCase,
    private fetchBusinessServiceUseCase: FetchBusinessServicesUseCase,
    private deleteBusinessServiceUseCase: DeleteBusinessServicesUseCase,
  ) {}

  @BusinessServicesApiDoc.Create()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user, @Body() body: CreateBusinessServicesDto) {
    const { sub: professionalId } = user;
    const { name, price } = body;
    const result = await this.createBusinessServiceUseCase.execute({
      professionalId,
      data: {
        name,
        price,
      },
    });
    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }
    const { businessService } = result.value;
    return BusinessServicePresenter.toHTTP(businessService);
  }

  @BusinessServicesApiDoc.Update()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async patch(
    @CurrentUser() user,
    @Param() { id }: UUIDParamDto,
    @Body() body: PatchBusinessServicesBodyDto,
  ) {
    const { sub: professionalId } = user;
    const { name, price } = body;

    const result = await this.patchBusinessServiceUseCase.execute({
      id,
      professionalId,
      data: {
        name,
        price,
      },
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }

    const { businessService } = result.value;
    return BusinessServicePresenter.toHTTP(businessService);
  }

  @BusinessServicesApiDoc.Fetch()
  @Get()
  @HttpCode(HttpStatus.OK)
  async fetch(@CurrentUser() user, @Query() queries: FiltersFetchQueriesDto) {
    const professionalId = user.sub;
    const { page, perPage } = queries;
    const { startDate, endDate } = queries.getProcessedDates();

    const result = await this.fetchBusinessServiceUseCase.execute({
      professionalId,
      pagination: {
        page,
        perPage,
      },
      dateRange: {
        startDate,
        endDate,
      },
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }

    const { businessServices } = result.value;

    return BusinessServicePresenter.toFetchHTTP({
      businessServices,
      pagination: {
        page,
        perPage,
      },
      dateRange: {
        startDate,
        endDate,
      },
    });
  }

  @BusinessServicesApiDoc.Delete()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user, @Param() { id }: UUIDParamDto) {
    const { sub: professionalId } = user;

    const result = await this.deleteBusinessServiceUseCase.execute({
      id,
      professionalId,
    });

    if (result.isLeft()) {
      throw mapDomainErrorToHttpException(result.value);
    }
  }
}
