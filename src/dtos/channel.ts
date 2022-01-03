import ChannelType from "./channel-type";

type Channel = {
  id: string,
  serverId: string,
  groupId: string,
  name: string,
  order: number,
  type: ChannelType
}

export default Channel;