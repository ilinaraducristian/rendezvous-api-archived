import { IsNotBlank } from "../IsNotBlank";

class NewMessageRequest {

  @IsNotBlank()
  text: string;

}

export default NewMessageRequest;