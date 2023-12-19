import { Injectable } from '@nestjs/common';
import { PostRepository } from '../post/repositories/post.repository';
import { ZoomFilterDto } from './dto/zoom-filter.dto';
import { Between } from 'typeorm';

@Injectable()
export class ZoomService {
  constructor(private postRepo: PostRepository) {}

  getAll() {
    return this.postRepo.find();
  }

  getDetail(id: number) {
    return this.postRepo.findOneBy({ id });
  }

  async getAllWithFilter(request: ZoomFilterDto) {
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
    const zooms = await this.postRepo.find({
      where: {
        price: Between(request.search_price_min, request.search_price_max),
      },
      order: order,
    });

    return zooms;
  }
}
