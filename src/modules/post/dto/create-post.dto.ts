import { IsNotEmpty, Length } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @Length(4, 40)
  title: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;
}
