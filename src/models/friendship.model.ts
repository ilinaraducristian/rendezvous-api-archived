import Message from './message.model';

type Friendship = {
  id: number,
  user1Id: string,
  user2Id: string,
  messages: Message[]
}

export default Friendship;