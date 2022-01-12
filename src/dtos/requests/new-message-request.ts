import { IsNotBlank } from "../../IsNotBlank";
import { IsArray } from "class-validator";

class NewMessageRequest {

  @IsNotBlank()
  text: string;

  @IsArray()
  files: string[];

}

export default NewMessageRequest;