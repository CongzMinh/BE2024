import { Module } from '@nestjs/common';
import { ZoomController } from './zoom.controller';
import { ZoomService } from './zoom.service';
import { PostRepository } from '../post/repositories/post.repository';

@Module({
  controllers: [ZoomController],
  providers: [ZoomService, PostRepository],
})
export class ZoomModule {}
