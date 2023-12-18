import { IsNotEmpty, Length } from 'class-validator';

export class UpdatePostDto {
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
}
