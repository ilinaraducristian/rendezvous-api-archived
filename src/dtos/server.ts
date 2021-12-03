import Channel from "./channel";
import Group from "./group";
import Member from "./member";

type Server = {
    id: string,
    name: string,
    order: number,
    channels: Channel[],
    groups: Group[],
    members: Member[]
}

export default Server;