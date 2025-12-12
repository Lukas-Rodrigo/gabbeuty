import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBusinessServicesDto {
  @IsString({ message: 'The property name must be a string' })
  @IsNotEmpty({ message: 'Required property name' })
  name: string;

  @IsNumber()
  price: number;
}
