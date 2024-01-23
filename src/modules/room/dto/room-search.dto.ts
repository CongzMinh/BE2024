import { IsNotEmpty, IsString } from 'class-validator';

export class SearchRoomDto {
  @IsNotEmpty()
  @IsString()
  address: string;
}
