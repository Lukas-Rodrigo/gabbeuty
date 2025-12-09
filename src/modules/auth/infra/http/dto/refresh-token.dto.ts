import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh Token',
    example: 'usuario@example.com',
  })
  @IsNotEmpty({ message: 'Required refresh token' })
  refreshToken: string;
}
