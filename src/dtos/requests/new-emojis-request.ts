import Emoji from "../emoji";
import { IsArray } from "class-validator";

class NewEmojisRequest {
  @IsArray()
  emojis: Emoji[];
}

export default NewEmojisRequest;
