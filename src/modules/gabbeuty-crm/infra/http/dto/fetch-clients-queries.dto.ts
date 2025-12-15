import { IntersectionType } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { DateRangeDto } from './date-range-query.dto';

export class FetchClientsQueriesDto extends IntersectionType(
  DateRangeDto,
  PaginationDto,
) {}
