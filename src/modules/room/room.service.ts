import { Injectable } from '@nestjs/common';
import { PostRepository } from '../post/repositories/post.repository';
import { RoomFilterDto } from './dto/room-filter.dto';
import { Between, Like } from 'typeorm';

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
        extension: Like(`%${request.extension}%`),
      },
      order: order,
    });



    return rooms;
  }
}


// async getAllWithFilter(request: RoomFilterDto) {
//     let order: Record<string, 'DESC' | 'ASC'>;

//     switch (request.sortBy) {
//       case 'newest':
//         order = { createdAt: 'DESC' };
//         break;
//       case 'LowToHigh':
//         order = { price: 'ASC', createdAt: 'DESC' };  
//       break;
//       case 'HighToLow':
//         order = { price: 'DESC', createdAt: 'DESC' };
//         break;
//       default:
//         order = { createdAt: 'ASC' };
//     }

//     // List of extensions to search for
//     const extensions = ['Have Wifi', ' Near Hospital', ' Allow animals'];

//     // Generate a LIKE query for each extension
//     const extensionLikes = extensions.map(ext => `extension LIKE '%${ext}%'`);

//     // Combine all LIKE queries with OR
//     const extensionQuery = extensionLikes.join(' OR ');

//     const rooms = await this.postRepo.find({
//       where: `(
//         price BETWEEN :search_price_min AND :search_price_max) AND (
//         area BETWEEN :search_area_min AND :search_area_max) AND (
//         ${extensionQuery}
//       )`,
//       order: order,
//       parameters: {
//         search_price_min: request.search_price_min,
//         search_price_max: request.search_price_max,
//         search_area_min: request.search_area_min,
//         search_area_max: request.search_area_max,
//       },
//     });

//     return rooms;
//  }
// }