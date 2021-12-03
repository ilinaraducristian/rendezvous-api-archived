import { IsString } from "class-validator";

class UpdateMessageRequest {

  @IsString()
  text: string;

}

export default UpdateMessageRequest;