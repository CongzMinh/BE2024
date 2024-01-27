import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import * as fs from 'fs';
import { PostRepository } from './repositories/post.repository';


@Injectable()
export class PostService {
  constructor(private postRepo: PostRepository) {}

  createPost(
    createPostDto: CreatePostDto,
    image: string[],
    currentUser: UserEntity,
  ) {
    const post = this.postRepo.create(createPostDto);
    post.user = currentUser;
    post.image = image ? image : [];
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
    image: string[],
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
    if (post.image && Array.isArray(post.image)) {
      post.image.forEach((imagePath: string) => {
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error(`Error deleting file: ${imagePath}`, error);
        }
      });
      post.image = null;
    }
    post.image = image;
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
