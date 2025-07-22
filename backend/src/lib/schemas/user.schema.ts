import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  photo?: string;

  @Prop({ default: false })
  online: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User); 