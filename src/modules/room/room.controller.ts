import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomFilterDto } from './dto/room-filter.dto';

@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  findAll() {
    return this.roomService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.roomService.getDetail(id);
  }

  @Post('search')
  getAllWithFilter(@Query() request: RoomFilterDto) {
    return this.roomService.getAllWithFilter(request);
  }
}
