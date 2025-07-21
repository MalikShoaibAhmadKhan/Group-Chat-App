import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Room extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: [] })
  users: string[]; // User IDs or usernames
}

export const RoomSchema = SchemaFactory.createForClass(Room); 