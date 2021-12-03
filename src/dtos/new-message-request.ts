import { IsString } from "class-validator";

class NewMessageRequest {

  @IsString()
  text: string;

}

export default NewMessageRequest;