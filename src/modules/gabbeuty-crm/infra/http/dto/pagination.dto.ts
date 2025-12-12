import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description:
      'Number of appointments to return per page. Used for pagination to limit the amount of data returned in a single request.',
    example: 15,
    default: 10,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The query perPage must be int' })
  @Min(1, { message: 'The query perPage min length 1' })
  perPage: number = 10;

  @ApiProperty({
    description:
      'Page number to retrieve. Used for pagination to navigate through multiple pages of results. Page numbering starts at 1.',
    example: 1,
    default: 1,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The query page must be int' })
  @Min(1, { message: 'The query page min length 1' })
  page: number = 1;
}
