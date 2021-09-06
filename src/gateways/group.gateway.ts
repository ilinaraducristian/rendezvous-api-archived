import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GroupService } from '../services/group/group.service';
import Socket from '../models/socket';
import { NewGroupRequest, NewGroupResponse } from '../dtos/group.dto';

@WebSocketGateway()
export class GroupGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly groupService: GroupService,
  ) {
  }

  @SubscribeMessage('create_group')
  async createGroup(client: Socket, payload: NewGroupRequest): Promise<NewGroupResponse> {
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
  async moveGroup(client: Socket, payload: any) {
    await this.groupService.moveGroup();
  }

}
