import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const createdUser = await this.userRepo.create(createUserDto);
    return this.userRepo.save(createdUser);
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

  async findByPhoneNumber(phoneNumber: string): Promise<UserEntity> {
    return this.userRepo.findOne({
      where: {
        phoneNumber,
      },
    });
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser: UserEntity,
  ) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (id !== currentUser.id) {
      throw new ForbiddenException('You do not have permission');
    }
    user.name = updateUserDto.name;
    user.email = updateUserDto.email;
    user.phoneNumber = updateUserDto.phoneNumber || '';
    console.log(user);
    return this.userRepo.save(user);
  }

  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
    currentUser: UserEntity,
  ) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const isMatchPassword = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );

    console.log(isMatchPassword);

    if (id !== currentUser.id || !isMatchPassword) {
      throw new ForbiddenException();
    }
    user.password = updatePasswordDto.newPassword;
    const salt = await bcrypt.genSalt(+process.env.APP_BCRYPT_SALT);
    user.password = await bcrypt.hash(user.password || user.password, salt);
    return this.userRepo.save(user);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
