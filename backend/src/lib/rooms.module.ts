import { Module } from '@nestjs/common';
import { MessagesModule } from './messages.module';

@Module({
  imports: [MessagesModule],
})
export class RoomsModule {}
