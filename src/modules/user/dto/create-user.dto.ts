import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Wallet address of user',
    example: '0x6bC5c16f1B044754F3D00AA98e45a8c6a7924845',
  })
  @IsNotEmpty()
  @Length(2, 255)
  address: string;
}
