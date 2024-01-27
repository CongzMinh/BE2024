import { IsNotEmpty, Length } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  published: boolean;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @Length(4, 40)
  title: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  area: number;

  @IsNotEmpty()
  capacity: number;

  @IsNotEmpty()
  electricityPrice: number;

  @IsNotEmpty()
  waterPrice: number;

  wifiPrice: number;

  serviceCharge: number;

  laundryFee: number;

  @IsNotEmpty()
  utilities: string[];
}
