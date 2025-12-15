import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UUIDParamDto {
  @ApiProperty({
    description: 'The UUID to patch',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Service ID must be a valid UUID' })
  id: string;
}
