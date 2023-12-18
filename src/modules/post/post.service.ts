import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './repositories/post.repository';
import { UserEntity } from '../user/entities/user.entity';
import { PostEntity } from './entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private postRepo: PostRepository) {}

  create(createPostDto: CreatePostDto, currentUser: UserEntity) {
    const post = this.postRepo.create(createPostDto);
    post.user = currentUser;
    return this.postRepo.save(post);
  }

  async getAll(currentUser: UserEntity) {
    const posts = await this.postRepo.find({
      where: { user: { id: currentUser.id } },
    });

    if (!posts) {
      throw new NotFoundException();
    }

    return posts;
  }

  async getOneById(id: number, currentUser: UserEntity) {
    const post = await this.postRepo.findOne({
      where: { user: { id: currentUser.id }, id: id },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async updateById(
    id: number,
    currentUser: UserEntity,
    updatePostDto: UpdatePostDto,
  ) {
    let post = await this.postRepo.findOne({
      where: { id: id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (!post.user || post.user.id !== currentUser.id) {
      throw new ForbiddenException('You do not have permission');
    }

    post = { ...post, ...updatePostDto };
    return this.postRepo.save(post);
  }

  async delete(id: number, currentUser: UserEntity) {
    const post = await this.postRepo.findOne({
      where: { id: id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (!post.user || post.user.id !== currentUser.id) {
      throw new ForbiddenException('You do not have permission');
    }

    return this.postRepo.remove(post);
  }
}
