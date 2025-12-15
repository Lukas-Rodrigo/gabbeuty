import { IntersectionType } from '@nestjs/swagger';
import { startOfDay, endOfDay } from 'date-fns';
import { PaginationDto } from './pagination.dto';
import { DateRangeDto } from './date-range-query.dto';

export class FiltersFetchQueriesDto extends IntersectionType(
  DateRangeDto,
  PaginationDto,
) {
  getProcessedDates() {
    return {
      startDate: this.startDate
        ? startOfDay(new Date(this.startDate))
        : undefined,
      endDate: this.endDate ? endOfDay(this.endDate) : undefined,
    };
  }
}
