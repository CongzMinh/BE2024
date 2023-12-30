import { Injectable } from '@nestjs/common';
import { PostRepository } from '../post/repositories/post.repository';
import { RoomFilterDto } from './dto/room-filter.dto';
import { Any, Between, ILike, In, IsNull, Like } from 'typeorm';

@Injectable()
export class RoomService {
  constructor(private postRepo: PostRepository) {}

  getAll() {
    return this.postRepo.find();
  }

  getDetail(id: number) {
    return this.postRepo.findOneBy({ id });
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
      },
      order: order,
    });

    return rooms;
  }
}