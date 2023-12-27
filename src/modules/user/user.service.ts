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
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  createUser(createUserDto: CreateUserDto) {
    const createdUser = this.userRepo.create(createUserDto);
    return this.userRepo.save(createdUser);
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: number) {
    return this.userRepo.findOneBy({ id });
  }

  findByEmail(email: string): Promise<UserEntity> {
    return this.userRepo.findOne({
      where: {
        email,
      },
    });
  }

  findByPhoneNumber(phoneNumber: string): Promise<UserEntity> {
    return this.userRepo.findOne({
      where: {
        phoneNumber,
      },
    });
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    avatar: string,
    currentUser: UserEntity,
  ) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (id !== currentUser.id) {
      throw new ForbiddenException('You do not have permission');
    }

    if (user.avatar) {
      fs.unlinkSync(user.avatar);

      user.avatar = null;
    }

    user.name = updateUserDto.name;
    user.email = updateUserDto.email;
    user.phoneNumber = updateUserDto.phoneNumber;
    user.avatar = avatar;
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

    if (id !== currentUser.id || !isMatchPassword) {
      throw new ForbiddenException();
    }
    user.password = updatePasswordDto.newPassword;
    const salt = await bcrypt.genSalt(+process.env.APP_BCRYPT_SALT);
    user.password = await bcrypt.hash(user.password || user.password, salt);
    return this.userRepo.save(user);
  }

  async removeAvatar(id: number, currentUser: UserEntity) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log(currentUser);

    if (id != currentUser.id) {
      throw new ForbiddenException();
    }

    if (user.avatar) {
      fs.unlinkSync(user.avatar);

      user.avatar = null;

      return this.userRepo.save(user);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
