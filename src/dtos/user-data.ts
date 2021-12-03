import User from "./user";
import Server from "./server";
import Friend from "./friend";

type UserData = {
    servers: Server[],
    users: User[],
    friends: Friend[]
}

export default UserData;