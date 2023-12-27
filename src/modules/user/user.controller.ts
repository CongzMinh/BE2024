import {
  Controller,
  Get,
  Body,
  Request,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Put,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'src/configs/multer.config';
import { extname } from 'path';

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
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: storageConfig('avatar'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Wrong extention type. Accepted file ext are: ${allowedExtArr}`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = 'File size is too large';
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )

  @Put('update/:id')
  updateUser(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    return this.userService.updateUser(
      id,
      updateUserDto,
      file.destination + '/' + file.filename,
      currentUser,
    );
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

  @UseGuards(JwtAuthGuard)
  @Delete('avatar/:id')
  deleteAvatar(
    @Param('id') id: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userService.removeAvatar(id, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
