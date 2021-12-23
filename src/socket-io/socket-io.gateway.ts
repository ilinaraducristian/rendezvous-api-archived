import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import SocketIoEvents from '../dtos/SocketIoEvents';

@WebSocketGateway()
class SocketIoGateway implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {

  handleConnection(client: Socket, ...args: any[]) {
    // TODO get user servers
    const userId = '';
    const servers = [{ id: '' }];
    servers.forEach(server => {
      client.to(server.id).emit(SocketIoEvents.userOnline, userId);
    });
  }

  handleDisconnect(client: Socket) {
    // TODO get user servers
    const userId = '';
    const servers = [{ id: '' }];
    servers.forEach(server => {
      client.to(server.id).emit(SocketIoEvents.userOffline, userId);
    });
  }

}

export default SocketIoGateway;