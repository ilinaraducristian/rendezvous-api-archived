import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GroupService } from 'src/services/group/group.service';

@WebSocketGateway()
export class GroupGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly groupService: GroupService,
  ) {
  }

  @SubscribeMessage('create_group')
  async createGroup(
    client: Socket,
    payload: { serverId: number; groupName: string },
  ): Promise<number> {
    const groupId = await this.groupService.createGroup(
      client.handshake.auth.sub,
      payload.serverId,
      payload.groupName,
    );
    const group = {
      id: groupId,
      serverId: payload.serverId,
      name: payload.groupName,
    };
    client.to(`server_${payload.serverId}`).emit('new_group', group);
    return groupId;
  }

  @SubscribeMessage('move_group')
  async moveGroup() {
    await this.groupService.moveGroup();
  }

}
