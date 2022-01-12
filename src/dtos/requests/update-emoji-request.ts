import { IsNotBlank } from "../../IsNotBlank";
import { IsHash } from "class-validator";

class UpdateEmojiRequest {

  @IsNotBlank()
  alias: string;

  @IsHash("md5")
  md5: string;

}

export default UpdateEmojiRequest;