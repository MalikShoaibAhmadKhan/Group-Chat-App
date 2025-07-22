import { Controller, Get, Post, Body, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async getRooms() {
    return this.roomsService.findAll();
  }

  @Get('count')
  async countRooms() {
    return this.roomsService.countRooms();
  }

  @Post()
  async createRoom(@Body('name') name: string) {
    return this.roomsService.create(name);
  }

  @Patch(':id')
  async renameRoom(@Param('id') id: string, @Body('name') name: string) {
    return this.roomsService.rename(id, name);
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string) {
    return this.roomsService.delete(id);
  }
} 