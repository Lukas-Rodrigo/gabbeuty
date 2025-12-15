import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { startOfDay, addDays, endOfDay } from 'date-fns';

export class DateRangeDto {
  @ApiProperty({
    description: 'Start date for filtering appointments in ISO 8601 format',
    example: '2025-01-01',
  })
  @IsDate({ message: 'Start date must be a valid date' })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'End date for filtering appointments in ISO 8601 format',
    example: '2025-10-31',
  })
  @IsDate({ message: 'End date must be a valid date' })
  @IsOptional()
  endDate?: Date;

  getProcessedDatesWithInterval({ intervalDays }: { intervalDays: number }) {
    const now = startOfDay(new Date());
    const intervalDaysFromNow = addDays(now, intervalDays);
    return {
      startDate: this.startDate ? startOfDay(new Date(this.startDate)) : now,
      endDate: this.endDate ? endOfDay(this.endDate) : intervalDaysFromNow,
    };
  }
}
