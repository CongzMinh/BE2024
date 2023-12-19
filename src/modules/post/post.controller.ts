import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../user/decorators/currentUser.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('post')
@ApiTags('Posts')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private postService: PostService) {}

  @Post('create')
  createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.postService.create(createPostDto, currentUser);
  }

  @Get()
  findAll(@CurrentUser() currentUser: UserEntity) {
    return this.postService.getAll(currentUser);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @CurrentUser() currentUser: UserEntity) {
    return this.postService.getOneById(id, currentUser);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @CurrentUser() currentUser: UserEntity,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updateById(id, currentUser, updatePostDto);
  }

  @Delete(':id')
  deletePost(@Param('id') id: number, @CurrentUser() currentUser: UserEntity) {
    return this.postService.delete(id, currentUser);
  }
}
