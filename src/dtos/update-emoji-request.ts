import { IsNotBlank } from "../IsNotBlank";

class UpdateEmojiRequest {

  @IsNotBlank()
  alias: string;

}

export default UpdateEmojiRequest;