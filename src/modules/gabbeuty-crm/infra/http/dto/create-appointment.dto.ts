import {
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDParamDto } from './uuid-param.dto';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'The UUID of the client',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4', { message: 'Client ID must be a valid UUID' })
  clientId: string;

  @ApiProperty({
    description: 'The date and time of the appointment in ISO 8601 format',
    example: '2025-10-22T15:30:00.000Z',
  })
  @IsDateString({}, { message: 'Date must be a valid ISO 8601 date string' })
  date: string;

  @ApiProperty({
    description: 'List of service IDs to be included in the appointment',
    type: [UUIDParamDto],
    example: [
      { id: '123e4567-e89b-12d3-a456-426614174000' },
      { id: '123e4567-e89b-12d3-a456-426614174002' },
    ],
  })
  @IsArray({ message: 'Services IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one service must be provided' })
  @ValidateNested({ each: true })
  @Type(() => UUIDParamDto)
  servicesIds: UUIDParamDto[];

  @ApiProperty({
    description:
      'Status of the appointment. Defaults to PENDING if not provided. Only PENDING or CONFIRMED are allowed when creating.',
    example: 'PENDING',
    enum: ['PENDING', 'CONFIRMED'],
    required: false,
    default: 'PENDING',
  })
  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED'], {
    message: 'Status must be either PENDING or CONFIRMED',
  })
  status?: 'PENDING' | 'CONFIRMED';
}
