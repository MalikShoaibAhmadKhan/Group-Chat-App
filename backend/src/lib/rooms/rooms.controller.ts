import { Controller, Get, Post, Body, UseGuards, Patch, Param, Delete, Req } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

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
  async createRoom(@Body('name') name: string, @Body('isPrivate') isPrivate: boolean, @Body('roomCode') roomCode: string, @Req() req: Request) {
    const creator = (req as any).user?.userId || (req as any).user?.sub;
    return this.roomsService.create(name, isPrivate, roomCode, creator);
  }

  @Patch(':id')
  async renameRoom(@Param('id') id: string, @Body('name') name: string, @Req() req: Request) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    return this.roomsService.renameIfCreator(id, name, userId);
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    return this.roomsService.deleteIfCreator(id, userId);
  }
} 