import Group from "./group";
import Member from "./member";

type Server = {
    id: string,
    name: string,
    invitation: string | null,
    invitation_exp: string | null,
    order: number,
    groups: Group[],
    members: Member[]
}

export default Server;