import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomFilterDto } from './dto/room-filter.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserEntity } from '../user/entities/user.entity';
import { PostEntity } from '../post/entities/post.entity';
import { SearchRoomDto } from './dto/room-search.dto';

@ApiTags('Room')
@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}
  @Post('filter')
  getAllWithFilter(@Body() request: RoomFilterDto) {
    return this.roomService.getAllWithFilter(request);
  }

  @Post('search')
  searchRoomsByAddress(
    @Body() searchRoomDto: SearchRoomDto,
  ): Promise<PostEntity[]> {
    return this.roomService.searchRoomsByAddress(searchRoomDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':roomId/like')
  async likePost(@Req() req, @Param('roomId') roomId: number): Promise<void> {
    const userId = req.user.id;
    await this.roomService.likePost(userId, roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':roomId/unlike')
  async unlikePost(
    @Req() req: any,
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<void> {
    const userId = req.user.id;

    await this.roomService.unlikePost(userId, roomId);
  }

  @Get(':roomId/likes-info')
  async getLikesInfo(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<UserEntity[]> {
    const likesInfo = await this.roomService.getLikesInfo(roomId);
    return likesInfo;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':roomId/comment')
  async createComment(
    @Req() req: any,
    @Param('roomId', ParseIntPipe) postId: number,
    @Body('content') content: string,
  ) {
    const userId = req.user.id; // Assuming your user object has an 'id' property

    return this.roomService.createComment(userId, postId, content);
  }

  @UseGuards(JwtAuthGuard)
  @Get('liked')
  async getLikedPosts(@Req() req) {
    const userId = req.user.id;
    const likedPosts = await this.roomService.getLikedPosts(userId);
    return likedPosts;
  }

  @Get('uploaded/:imagepth')
  seeUploadedFile(@Param('imagepth') image: string, @Res() res: any) {
    return res.sendFile(image, { root: 'uploads/image' });
  }

  @Get()
  findAll() {
    return this.roomService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.roomService.getDetail(id);
  }
}
