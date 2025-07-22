import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':roomId')
  async getMessages(@Param('roomId') roomId: string) {
    return this.messagesService.findByRoom(roomId);
  }

  @Get('count')
  async countMessages() {
    return this.messagesService.countMessages();
  }

  @Post()
  async sendMessage(
    @Body('content') content: string,
    @Body('roomId') roomId: string,
    @Request() req
  ) {
    return this.messagesService.sendMessage(req.user.username, content, roomId, req.user.userId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      }
    })
  }))
  async uploadMessageFile(
    @UploadedFile() file: any, // Use 'any' for compatibility; for type safety, use Express.Multer.File with @types/express and @types/multer
    @Body('content') content: string,
    @Body('roomId') roomId: string,
    @Request() req
  ) {
    const fileUrl = `/uploads/${file.filename}`;
    const fileType = file.mimetype;
    const fileName = file.originalname;
    return this.messagesService.sendMessageWithFile(
      req.user.username,
      content,
      roomId,
      fileUrl,
      fileType,
      fileName,
      req.user.userId
    );
  }

  @Patch(':id')
  async editMessage(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req
  ) {
    return this.messagesService.editMessage(id, content, req.user.username);
  }

  @Patch(':id/reactions')
  async updateReactions(
    @Param('id') id: string,
    @Body('reactions') reactions: { [emoji: string]: string[] },
    @Request() req
  ) {
    return this.messagesService.updateReactions(id, reactions);
  }

  @Delete(':id')
  async deleteMessage(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.messagesService.deleteMessage(id, req.user.username);
  }
} 