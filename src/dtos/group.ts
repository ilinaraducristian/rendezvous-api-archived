import Channel from "./channel";

type Group = {
    id: string,
    serverId: string,
    name: string,
    channels: Channel[]
}

export default Group;