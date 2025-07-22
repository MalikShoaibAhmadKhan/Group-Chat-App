import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { getModelToken } from '@nestjs/mongoose';
import { Room } from '../schemas/room.schema';

describe('RoomsService', () => {
  let service: RoomsService;
  let mockRoomModel: any;

  beforeEach(async () => {
    mockRoomModel = {
      create: jest.fn().mockResolvedValue({ name: 'Test Room', isPrivate: false, creator: 'user1' }),
      find: jest.fn().mockResolvedValue([]),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: getModelToken(Room.name), useValue: mockRoomModel },
      ],
    }).compile();
    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a room', async () => {
    const room = await service.create('Test Room', false, undefined, 'user1');
    expect(room).toHaveProperty('name', 'Test Room');
    expect(room).toHaveProperty('creator', 'user1');
    expect(mockRoomModel.create).toHaveBeenCalled();
  });
}); 