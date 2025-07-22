import { Controller, Post, Body, Get, UseGuards, Req, Patch, UploadedFile, UseInterceptors, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { username: string; password: string }) {
    return this.authService.register(body.username, body.password);
  }

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req: any) {
    return this.authService.profile(req.user.userId);
  }

  @Get('count')
  async countUsers() {
    return this.authService.countUsers();
  }

  @Get('user/:id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      }
    })
  }))
  async updateProfile(
    @Req() req: any,
    @Body('name') name: string,
    @Body('password') password: string,
    @Body('newPassword') newPassword: string,
    @UploadedFile() photo: any
  ) {
    let photoUrl: string | undefined = undefined;
    if (photo) {
      photoUrl = `/uploads/${photo.filename}`;
    }
    return this.authService.updateProfile(req.user.userId, name, password, newPassword, photoUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.userId);
  }

  @Get('online-count')
  async countOnlineUsers() {
    return this.authService.countOnlineUsers();
  }
}
