import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@/modules/gabbeuty-crm/domain/entities/value-objects/appointment-status.vo';

export class CountAppointmentByStatusBodyDto {
  @ApiProperty({
    description: 'Appointment status to filter by',
    enum: AppointmentStatus,
    example: 'CONFIRMED',
  })
  @IsEnum(AppointmentStatus, {
    message: 'Status must be one of: PENDING, CONFIRMED, COMPLETED, CANCELED',
  })
  status: AppointmentStatus;
}
