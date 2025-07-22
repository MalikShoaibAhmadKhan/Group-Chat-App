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

  async create(name: string): Promise<Room> {
    const newRoom = new this.roomModel({ name });
    return newRoom.save();
  }

  async rename(id: string, name: string): Promise<Room | null> {
    return this.roomModel.findByIdAndUpdate(id, { name }, { new: true }).exec();
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const res = await this.roomModel.deleteOne({ _id: id }).exec();
    return { deleted: res.deletedCount === 1 };
  }

  async countRooms() {
    return this.roomModel.countDocuments();
  }
} 