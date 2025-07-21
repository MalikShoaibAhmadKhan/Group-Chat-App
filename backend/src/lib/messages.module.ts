import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  controllers: [RoomsController, MessagesController],
  providers: [RoomsService, MessagesService],
})
export class MessagesModule {}
