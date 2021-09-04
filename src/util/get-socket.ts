import { Server } from 'socket.io';
import Socket from '../models/socket';

function getSocketByUserId(server: Server, userId: string): Socket | undefined {
  const sockets = server.sockets.sockets.values();
  for (const socket of sockets) {
    if (socket.handshake.auth.sub === userId) {
      return socket as unknown as Socket;
    }
  }
}

export default getSocketByUserId;