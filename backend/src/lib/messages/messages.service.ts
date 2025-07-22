import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from '../schemas/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async findByRoom(roomId: string) {
    return this.messageModel.find({ room: roomId }).sort({ createdAt: 1 }).exec();
  }

  async sendMessage(sender: string, content: string, roomId: string, senderId: string) {
    const message = new this.messageModel({ sender, content, room: roomId, senderId });
    return message.save();
  }

  async sendMessageWithFile(sender: string, content: string, roomId: string, fileUrl: string, fileType: string, fileName: string, senderId: string) {
    const message = new this.messageModel({ sender, content, room: roomId, fileUrl, fileType, fileName, senderId });
    return message.save();
  }

  async editMessage(id: string, content: string, username: string) {
    const msg = await this.messageModel.findById(id);
    if (!msg) return null;
    if (msg.sender !== username) throw new Error('Unauthorized');
    msg.content = content;
    msg.edited = true;
    await msg.save();
    return msg;
  }

  async deleteMessage(id: string, username: string) {
    const msg = await this.messageModel.findById(id);
    if (!msg) return null;
    if (msg.sender !== username) throw new Error('Unauthorized');
    msg.content = '[deleted]';
    msg.deleted = true;
    await msg.save();
    return { deleted: true };
  }

  async updateReactions(id: string, reactions: { [emoji: string]: string[] }) {
    const msg = await this.messageModel.findById(id);
    if (!msg) return null;
    msg.reactions = reactions;
    await msg.save();
    return msg;
  }

  async countMessages() {
    return this.messageModel.countDocuments();
  }
} 