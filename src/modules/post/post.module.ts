import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostRepository } from './repositories/post.repository';
import { RolesGuard } from '../auth/roles.guard';
import { UserRepository } from '../user/repositories/user.repository';
import { FavoritePostRepository } from './repositories/favorite-post.reponsitory';
import { CommentRepository } from './repositories/comment.repository';

@Module({
  providers: [
    PostService,
    UserRepository,
    PostRepository,
    FavoritePostRepository,
    CommentRepository,
    RolesGuard,
  ],
  controllers: [PostController],
})
export class PostModule {}
