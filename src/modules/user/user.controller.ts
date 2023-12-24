import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/shared/decoratos/get-request-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/shared/decoratos/role.decorator';
import { Role } from 'src/shared/enums/user.enum';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from './decorators/currentUser.decorator';
import { UserEntity } from './entities/user.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('user')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @Get()
  // @LogExecutionTime()
  async findAll(@GetUser() user) {
    console.log('========= user : ', user);
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/password/:id')
  updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: UserEntity,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(id, updatePasswordDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
