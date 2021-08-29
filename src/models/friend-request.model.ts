// type FriendRequest = {
//   id: number,
//   user1Id: string,
//   user2Id: string,
//   status: 'pending' | 'accepted' | 'declined'
// }

type FriendRequest = {
  id: number,
  userId: string,
  incoming: boolean
}

export default FriendRequest;