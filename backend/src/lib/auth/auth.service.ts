import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async register(username: string, password: string) {
    const existing = await this.userModel.findOne({ username });
    if (existing) throw new UnauthorizedException('User already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = new this.userModel({ username, password: hashed });
    await user.save();
    return { message: 'Registration successful' };
  }

  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    user.online = true;
    await user.save();

    const payload = { sub: user._id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(userId: string) {
    const user = await this.userModel.findById(userId);
    if (user) {
      user.online = false;
      await user.save();
    }
    return { message: 'Logged out' };
  }

  async profile(userId: string) {
    return this.userModel.findById(userId).select('-password');
  }

  async updateProfile(userId: string, name: string, password: string, newPassword: string, photoUrl?: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    if (name && name !== user.username) {
      const existing = await this.userModel.findOne({ username: name });
      if (existing && existing._id.toString() !== userId) {
        throw new UnauthorizedException('Username already taken');
      }
      user.username = name;
    }
    if (photoUrl) user.photo = photoUrl;
    if (newPassword) {
      if (!password) throw new UnauthorizedException('Current password required');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new UnauthorizedException('Invalid current password');
      user.password = await bcrypt.hash(newPassword, 10);
    }
    await user.save();
    const { password: _, ...profile } = user.toObject();
    const payload = { sub: user._id, username: user.username };
    const access_token = this.jwtService.sign(payload);
    return { profile, access_token };
  }

  async countUsers() {
    return this.userModel.countDocuments();
  }

  async countOnlineUsers() {
    return this.userModel.countDocuments({ online: true });
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
