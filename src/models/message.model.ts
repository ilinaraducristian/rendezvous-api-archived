import { Message as MessageDTO } from '../dtos/message.dto';

export type Message = Omit<MessageDTO, 'image'> & { imageMd5: string | null }