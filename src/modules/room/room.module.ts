import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PostRepository } from '../post/repositories/post.repository';

@Module({
  controllers: [RoomController],
  providers: [RoomService, PostRepository],
})
export class RoomModule {}
