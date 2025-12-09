import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString({ message: 'The property name must be a string' })
  @IsNotEmpty({ message: 'Required property name' })
  name: string;

  @IsEmail({}, { message: 'Invalid e-mail' })
  @IsNotEmpty({ message: 'Required property e-mail' })
  email: string;

  @IsString({ message: 'The password must be a string' })
  @IsNotEmpty({ message: 'Required property password' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
