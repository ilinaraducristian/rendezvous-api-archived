import { IsNotBlank } from "../IsNotBlank";
import { IsHash } from "class-validator";

class Emoji {

  @IsNotBlank()
  alias: string;

  @IsHash("md5")
  md5: string;

}

export default Emoji;