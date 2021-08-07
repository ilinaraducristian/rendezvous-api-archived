type User = {
  id: string,
  username: string,
  firstName: string,
  lastName: string
}

export type KeycloakUser = {
  sub: string,
  preferred_username: string,
  email: string, name: string,
  nickname: string,
  given_name: string,
  family_name: string
}


export default User;