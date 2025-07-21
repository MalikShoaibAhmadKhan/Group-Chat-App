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

    const payload = { sub: user._id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async profile(userId: string) {
    return this.userModel.findById(userId).select('-password');
  }
}
