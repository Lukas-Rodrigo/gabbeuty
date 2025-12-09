import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@example.com',
  })
  @IsEmail({}, { message: 'Invalid e-mail' })
  @IsNotEmpty({ message: 'Required e-mail' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha12345',
    minLength: 8,
  })
  @IsString({ message: 'The password must be a string' })
  @IsNotEmpty({ message: 'Required password' })
  password: string;
}
