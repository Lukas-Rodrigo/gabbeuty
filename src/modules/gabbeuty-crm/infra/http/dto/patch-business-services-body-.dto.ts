import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class PatchBusinessServicesBodyDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;
}
