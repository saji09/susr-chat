// app/lib/socket.ts
import { Server } from 'socket.io';
import { NextApiRequest } from 'next';

export const initializeSocket = (req: NextApiRequest) => {
  if (!(req as any).socket.server.io) {
    const io = new Server((req as any).socket.server);
    
    io.on('connection', (socket) => {
      socket.on('join-chat', (chatId) => {
        socket.join(chatId);
      });
      
      socket.on('send-message', (data) => {
        socket.to(data.chatId).emit('receive-message', data);
      });
    });
    
    (req as any).socket.server.io = io;
  }
};