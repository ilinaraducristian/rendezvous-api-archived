import { UserServersDataQueryResult } from 'src/models/server.model';
import { UserServersData } from 'src/models/server.model';
import Server from 'src/models/server.model';
import User from 'src/models/user.model';
import Member from 'src/models/member.model';
import { UserEntity } from 'src/entities/user.entity';
import Group from 'src/models/group.model';
import { TextChannel } from 'src/models/channel.model';
import { VoiceChannel } from 'src/models/channel.model';
import { ChannelType } from 'src/models/channel.model';

function processQuery(
  result: UserServersDataQueryResult,
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