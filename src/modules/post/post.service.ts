import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './repositories/post.repository';

@Injectable()
export class PostService {
  constructor(private postRepo: PostRepository) {}

  async create(createPostDto: CreatePostDto) {
    const post = await this.postRepo.create(createPostDto);
    return this.postRepo.save(post);
  }
}
