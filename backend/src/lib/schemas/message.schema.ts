import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Room } from './room.schema';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  sender: string; // user ID or username

  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Room' })
  room: Room;

  @Prop()
  fileUrl?: string;

  @Prop()
  fileType?: string;

  @Prop()
  fileName?: string;

  @Prop({ default: false })
  edited: boolean;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ type: Object, default: {} })
  reactions?: { [emoji: string]: string[] };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  senderId?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message); 