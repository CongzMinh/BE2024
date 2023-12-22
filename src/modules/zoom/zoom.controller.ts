import { Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ZoomService } from './zoom.service';
import { ZoomFilterDto } from './dto/zoom-filter.dto';

@Controller('zoom')
export class ZoomController {
  constructor(private zoomService: ZoomService) {}

  @Get()
  findAll() {
    return this.zoomService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.zoomService.getDetail(id);
  }

  @Put('search')
  getAllWithFilter(@Query() request: ZoomFilterDto) {
    return this.zoomService.getAllWithFilter(request);
  }
}
