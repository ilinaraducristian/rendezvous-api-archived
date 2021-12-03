import UserStatus from "./user-status";

type User = {
    id: string,
    name: string,
    status: UserStatus,
    avatar: string | null
}

export default User;