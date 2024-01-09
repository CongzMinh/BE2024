import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomFilterDto } from './dto/room-filter.dto';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Room')
@Controller('room')
@UseGuards(RolesGuard)
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
