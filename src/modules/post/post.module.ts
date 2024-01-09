import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostRepository } from './repositories/post.repository';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  providers: [PostService, PostRepository, RolesGuard],
  controllers: [PostController],
})
export class PostModule {}
