import { IsArray } from "class-validator";

class DeleteEmojisRequest {

  @IsArray()
  emojisMd5s: string[];

}

export default DeleteEmojisRequest;