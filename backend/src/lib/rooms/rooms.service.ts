import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Room } from '../schemas/room.schema';
import { Model } from 'mongoose';

@Injectable()
export class RoomsService {
  constructor(@InjectModel(Room.name) private roomModel: Model<Room>) {}

  async findAll(): Promise<Room[]> {
    return this.roomModel.find().exec();
  }

  async create(name: string, isPrivate = false, roomCode?: string, creator?: string): Promise<Room> {
    if (isPrivate && !roomCode) {
      roomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    }
    const newRoom = new this.roomModel({ name, isPrivate, roomCode, creator });
    return newRoom.save();
  }

  async rename(id: string, name: string): Promise<Room | null> {
    return this.roomModel.findByIdAndUpdate(id, { name }, { new: true }).exec();
  }

  async renameIfCreator(id: string, name: string, userId: string): Promise<Room | null> {
    const room = await this.roomModel.findById(id).exec();
    if (!room) return null;
    if (room.creator !== userId) throw new Error('Only the creator can rename this room');
    return this.roomModel.findByIdAndUpdate(id, { name }, { new: true }).exec();
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const res = await this.roomModel.deleteOne({ _id: id }).exec();
    return { deleted: res.deletedCount === 1 };
  }

  async deleteIfCreator(id: string, userId: string): Promise<{ deleted: boolean }> {
    const room = await this.roomModel.findById(id).exec();
    if (!room) return { deleted: false };
    if (room.creator !== userId) throw new Error('Only the creator can delete this room');
    const res = await this.roomModel.deleteOne({ _id: id }).exec();
    return { deleted: res.deletedCount === 1 };
  }

  async countRooms() {
    return this.roomModel.countDocuments();
  }
} 