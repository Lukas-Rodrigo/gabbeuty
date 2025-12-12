import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsString({ message: 'The property name must be a string' })
  @IsNotEmpty({ message: 'Required property name' })
  @MinLength(3, {
    message: 'The property name must be at least 3 characters long',
  })
  name: string;

  @IsString({ message: 'The property phoneNumber must be a string' })
  @IsNotEmpty({ message: 'Required property phoneNumber' })
  @MinLength(8, {
    message: 'The property phoneNumber must be at least 8 characters long',
  })
  phoneNumber: string;

  @IsString({ message: 'The property profileUrl must be a string' })
  @IsOptional()
  profileUrl?: string;
  @IsString({ message: 'The property observation must be a string' })
  @IsOptional()
  observation?: string;
}
