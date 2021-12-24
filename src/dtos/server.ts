import Group from "./group";
import Member from "./member";
import Invitation from "./invitation";

type Server = {
    id: string,
    name: string,
    invitation: Invitation | null,
    order: number,
    groups: Group[],
    members: Member[]
}

export default Server;