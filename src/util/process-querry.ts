import Server, { UserServersData } from '../models/server.model';
import User from '../models/user.model';
import Member from '../models/member.model';
import { UserEntity } from '../entities/user.entity';
import Group from '../models/group.model';
import { ChannelType, TextChannel, VoiceChannel } from '../models/channel.model';
import { ProcedureUserDataResponseType } from '../models/database-response.model';


function processQuery(
  result: ProcedureUserDataResponseType,
): UserServersData {

  const serversTable: Server[] = result[0].map((server: Omit<Server, 'channels' | 'groups' | 'members'>) => ({
    ...server,
    channels: [],
    groups: [],
    members: [],
  }));

  const usersTable: User[] = [];

  result[3].forEach((member: Member) => {
    const server = serversTable.find(server => server.id === member.serverId);
    if (server === undefined) return;
    if (server.members.findIndex(m1 => m1.id === member.id) === -1)
      server.members.push({
        id: member.id,
        userId: member.userId,
        serverId: member.serverId,
      });

  });

  result[4].forEach((user: UserEntity) => {
    const existingUserIndex = usersTable.findIndex(usr => usr.id === user.ID);
    if (existingUserIndex === -1)
      usersTable.push({
        id: user.ID,
        username: user.USERNAME,
        firstName: user.FIRST_NAME,
        lastName: user.LAST_NAME,
      });
  });

  result[1].forEach((group: Omit<Group, 'channels'>) => {
    const server = serversTable.find(server => server.id === group.serverId);
    if (server === undefined) return;
    server.groups.push({ ...group, channels: [] });
  });

  result[2].forEach((channel: TextChannel | VoiceChannel) => {
    if (channel.type === ChannelType.Text) {
      (channel as TextChannel).messages = [];
    }
    const server = serversTable.find(server => server.id === channel.serverId);
    if (channel.groupId === null)
      server.channels.push(channel);
    else {
      const group = server.groups.find(group => group.id === channel.groupId);
      if (group === undefined) return;
      group.channels.push(channel);
    }
  });


  return {
    servers: serversTable,
    users: usersTable,
  };
}

export default processQuery;