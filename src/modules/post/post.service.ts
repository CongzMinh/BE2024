import {

  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import * as fs from 'fs';

import { UserRepository } from '../user/repositories/user.repository';
import { PostRepository } from './repositories/post.repository';
import { FavoritePostRepository } from './repositories/favorite-post.reponsitory';
import { CommentRepository } from './repositories/comment.repository';

@Injectable()
export class PostService {
  constructor(
    private userRepo: UserRepository,
    private postRepo: PostRepository,
    private favoritePostRepo: FavoritePostRepository,
    private commentRepo: CommentRepository,
  ) {}

  createPost(
    createPostDto: CreatePostDto,
    image: string[],
    currentUser: UserEntity,
  ) {
    const post = this.postRepo.create(createPostDto);
    post.user = currentUser;
    post.image = image;
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

  //Favorite Posy Function

  async likePost(userId: number, postId: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingFavorite = await this.favoritePostRepo.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (!existingFavorite) {
      const newFavorite = this.favoritePostRepo.create({
        user: user,
        post: post,
      });
      await this.favoritePostRepo.save(newFavorite);
    }
  }

  async getLikedPosts(userId: number) {
    try {
      const favorites = await this.favoritePostRepo.find({
        where: { user: { id: userId } },
        relations: ['post'],
      });
      return favorites;
    } catch (error) {
      throw new Error(`Error retrieving liked posts: ${error.message}`);
    }
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    try {
      // Find the FavoritePostEntity to delete
      const favoriteToRemove = await this.favoritePostRepo.findOne({
        where: { user: { id: userId }, post: { id: postId } },
      });

      if (!favoriteToRemove) {
        throw new Error('Favorite not found');
      }

      // Remove the favorite from the database
      await this.favoritePostRepo.remove(favoriteToRemove);

      console.log(
        `Successfully removed like for user ${userId} on post ${postId}`,
      );
    } catch (error) {
      console.error(`Error removing like: ${error.message}`);
      throw new Error(`Error removing like: ${error.message}`);
    }
  }

  async getLikesCount(postId: number): Promise<number> {
    try {
      // Count the number of likes for the specified post
      const likesCount = await this.favoritePostRepo.count({
        where: { post: { id: postId } },
      });

      return likesCount;
    } catch (error) {
      console.error(`Error retrieving likes count: ${error.message}`);
      throw new Error(`Error retrieving likes count: ${error.message}`);
    }
  }

  //Comment Function
  async createComment(
    userId: number,
    postId: number,
    content: string,
  ): Promise<any> {
    const comment = this.commentRepo.create({
      user: { id: userId },
      post: { id: postId },
      content,
    });

    return await this.commentRepo.save(comment);
  }

  async getCommentsByPost(postId: number): Promise<any> {
    return this.commentRepo.find({
      where: { post: { id: postId } },
      order: { createdAt: 'DESC' },
    });
  }
}
