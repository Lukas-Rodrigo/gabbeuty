import { IsOptional, IsString, MinLength } from 'class-validator';

export class PatchClientDto {
  @IsString({ message: 'The property name must be a string' })
  @MinLength(3, {
    message: 'The property name must be at least 3 characters long',
  })
  @IsOptional()
  name?: string;

  @IsString({ message: 'The property phoneNumber must be a string' })
  @MinLength(8, {
    message: 'The property phoneNumber must be at least 8 characters long',
  })
  @IsOptional()
  phoneNumber?: string;

  @IsString({ message: 'The property profileUrl must be a string' })
  @IsOptional()
  profileUrl?: string;
  @IsString({ message: 'The property observation must be a string' })
  @IsOptional()
  observation?: string;
}
