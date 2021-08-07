import Channel from './channel.model';

type Group = {
  id: number,
  serverId: number,
  name: string,
  channels: Channel[] // channels in a group
}

export default Group;