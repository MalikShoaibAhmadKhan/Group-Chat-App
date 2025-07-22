const mongoose = require('mongoose');
const { hashSync } = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/group-chat';

// Define schemas (minimal for seeding)
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  online: Boolean,
});
const roomSchema = new mongoose.Schema({
  name: String,
  users: [String],
  isPrivate: Boolean,
  roomCode: String,
  creator: String,
});
const messageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  room: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Room = mongoose.model('Room', roomSchema);
const Message = mongoose.model('Message', messageSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany({});
  await Room.deleteMany({});
  await Message.deleteMany({});

  // Create users
  const users = await User.insertMany([
    { username: 'alice', password: hashSync('password', 10), online: false },
    { username: 'bob', password: hashSync('password', 10), online: false },
    { username: 'charlie', password: hashSync('password', 10), online: false },
  ]);

  // Remove creation of messages for deleted rooms

  console.log('Seed data inserted!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
}); 