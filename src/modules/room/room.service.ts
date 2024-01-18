import { BadRequestException, Injectable } from '@nestjs/common';
import { PostRepository } from '../post/repositories/post.repository';
import { RoomFilterDto } from './dto/room-filter.dto';
import { Any, Between, ILike } from 'typeorm';
import { PostEntity } from '../post/entities/post.entity';

@Injectable()
export class RoomService {
  constructor(private postRepo: PostRepository) {}

  async getAll(): Promise<PostEntity[]> {
    return this.postRepo.find({
      where: { published: true },
      relations: ['user', 'comments'],
    });
  }

  async getDetail(id: number): Promise<PostEntity | undefined> {
    const zoom = await this.postRepo.findOne({
      where: { id, published: true },
      relations: ['user'],
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
        utilities: Any(ILike(`%${request.utilities}%`)),
        published: true,
      },
      order: order,
    });

    return rooms;
  }
}
