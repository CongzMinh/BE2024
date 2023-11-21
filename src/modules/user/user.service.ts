import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { httpErrors } from 'src/shared/helper/exceptions';
import { Role } from 'src/shared/enums/user.enum';
import { LoginWithWalletDto } from '../auth/dto/login-wallet.dto';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async create(createUserDto: LoginWithWalletDto) {
    return this.userRepo.save({
      name: 'random name',
      email: 'randomemail@gmail.com',
      phonenumber: '0398992312',
      address: createUserDto.address,
      role: Role.USER,
    });
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: number) {
    return this.userRepo.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepo.findOne({
      where: {
        email,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user with body ${updateUserDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
