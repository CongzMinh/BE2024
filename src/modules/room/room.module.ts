import { Module } from '@nestjs/common';

import { RoomService } from './room.service';
import { PostRepository } from '../post/repositories/post.repository';
import { RoomController } from './room.controller';
import { CommentRepository } from './repositories/comment.repository';
import { FavoritePostRepository } from './repositories/favorite-post.reponsitory';
import { UserRepository } from '../user/repositories/user.repository';

@Module({
  controllers: [RoomController],
  providers: [
    RoomService,
    PostRepository,
    UserRepository,
    CommentRepository,
    FavoritePostRepository,
  ],
})
export class RoomModule {}
