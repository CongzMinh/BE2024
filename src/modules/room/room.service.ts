import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from '../post/repositories/post.repository';
import { RoomFilterDto } from './dto/room-filter.dto';
import { Any, Between, ILike } from 'typeorm';
import { PostEntity } from '../post/entities/post.entity';
import { UserRepository } from '../user/repositories/user.repository';
import { FavoritePostRepository } from './repositories/favorite-post.reponsitory';
import { CommentRepository } from './repositories/comment.repository';
import { UserEntity } from '../user/entities/user.entity';
import { SearchRoomDto } from './dto/room-search.dto';

@Injectable()
export class RoomService {
  constructor(
    private postRepo: PostRepository,
    private userRepo: UserRepository,
    private favoritePostRepo: FavoritePostRepository,
    private commentRepo: CommentRepository,
  ) {}

  async getAll(): Promise<PostEntity[]> {
    return this.postRepo.find({
      where: { published: true },
      relations: ['likedBy.user'],
    });
  }

  async getDetail(id: number): Promise<PostEntity | undefined> {
    const zoom = await this.postRepo.findOne({
      where: { id, published: true },
      relations: ['user', 'comments', 'comments.user'],
    });
    if (!zoom) {
      throw new BadRequestException('Can not found!');
    }
    return zoom;
  }

  async getAllWithFilter(request: RoomFilterDto) {
    let order: Record<string, 'DESC' | 'ASC'>;

    switch (request.sortBy) {
      case 'newest':
        order = { createdAt: 'DESC' };
        break;
      case 'LowToHigh':
        order = { price: 'ASC', createdAt: 'DESC' };
        break;
      case 'HighToLow':
        order = { price: 'DESC', createdAt: 'DESC' };
        break;
      default:
        order = { createdAt: 'ASC' };
    }

    const rooms = await this.postRepo.find({
      where: {
        price: Between(request.search_price_min, request.search_price_max),
        area: Between(request.search_area_min, request.search_area_max),
        published: true,
      },
      order: order,
    });

    return rooms;
  }

  async searchRoomsByAddress(
    searchRoomDto: SearchRoomDto,
  ): Promise<PostEntity[]> {
    const { address } = searchRoomDto;
    console.log('Search Criteria:', { address: ILike(`%${address}%`) });

    return this.postRepo.find({
      where: { address: ILike(`%${address}%`) },
    });
  }

  //Favorite Posy Function

  async likePost(userId: number, roomId: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.postRepo.findOne({ where: { id: roomId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingFavorite = await this.favoritePostRepo.findOne({
      where: { user: { id: userId }, post: { id: roomId } },
    });

    if (!existingFavorite) {
      const newFavorite = this.favoritePostRepo.create({
        user: user,
        post: post,
      });
      await this.favoritePostRepo.save(newFavorite);
    }
  }

  async getLikedPosts(roomId: number) {
    try {
      const favorites = await this.favoritePostRepo.find({
        where: { user: { id: roomId } },
        relations: ['post'],
      });
      const likedPosts = favorites.map((favorite) => favorite.post);

      return likedPosts;
    } catch (error) {
      throw new Error(`Error retrieving liked posts: ${error.message}`);
    }
  }

  async unlikePost(userId: number, roomId: number): Promise<void> {
    try {
      // Find the FavoritePostEntity to delete
      const favoriteToRemove = await this.favoritePostRepo.findOne({
        where: { user: { id: userId }, post: { id: roomId } },
      });

      if (!favoriteToRemove) {
        throw new Error('Favorite not found');
      }

      // Remove the favorite from the database
      await this.favoritePostRepo.remove(favoriteToRemove);

      console.log(
        `Successfully removed like for user ${userId} on post ${roomId}`,
      );
    } catch (error) {
      console.error(`Error removing like: ${error.message}`);
      throw new Error(`Error removing like: ${error.message}`);
    }
  }

  async getLikesInfo(roomId: number): Promise<UserEntity[]> {
    try {
      // Retrieve likes count and liked users for the specified post
      const likedPosts = await this.favoritePostRepo.find({
        where: { post: { id: roomId } },
        relations: ['user'], // Assuming there is a relationship between FavoritePostEntity and UserEntity
      });
      const likedUsers = likedPosts.map((favorite) => favorite.user);
  
      return likedUsers;
    } catch (error) {
      console.error(`Error retrieving likes info: ${error.message}`);
      throw new Error(`Error retrieving likes info: ${error.message}`);
    }
  }

  //Comment Function
  async createComment(
    userId: number,
    roomId: number,
    content: string,
  ): Promise<any> {
    const comment = this.commentRepo.create({
      user: { id: userId },
      post: { id: roomId },
      content,
    });

    return await this.commentRepo.save(comment);
  }

}
