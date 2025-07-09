import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  name: { type: String, required: true },
  password: { type: String, required: true, select: false },
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);