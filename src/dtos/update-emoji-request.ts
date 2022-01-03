import Emoji from "./emoji";
import { IsInstance } from "class-validator";

class UpdateEmojiRequest {

  @IsInstance(Emoji)
  emoji: Emoji;

}

export default UpdateEmojiRequest;