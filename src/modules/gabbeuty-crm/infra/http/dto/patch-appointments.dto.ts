import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { UUIDParamDto } from './uuid-param.dto';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';

export class PatchAppointmentDto {
  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: 'CONFIRMED',
    required: false,
  })
  @IsEnum(AppointmentStatus, {
    message: 'Status must be one of: PENDING, CONFIRMED, COMPLETED, CANCELED',
  })
  @IsOptional()
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'New date and time for the appointment in ISO 8601 format',
    example: '2025-10-25T15:30:00.000Z',
    required: false,
  })
  @IsDateString({}, { message: 'Date must be a valid ISO 8601 date string' })
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: 'New title for the appointment',
    example: 'Jane Doe: Manicure + Pedicure',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'The title must be a string' })
  title?: string;

  @ApiProperty({
    description: 'List of service IDs to update',
    type: [UUIDParamDto],
    example: [
      { id: '41231231-be6d-4cb6-bfba-62f126332e7e' },
      { id: 'a4b38a12-be6d-4cb6-bfba-123456789abc' },
    ],
    required: false,
  })
  @IsArray({ message: 'Services IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one service must be provided' })
  @ValidateNested({ each: true })
  @Type(() => UUIDParamDto)
  @IsOptional()
  servicesIds?: UUIDParamDto[];
}
