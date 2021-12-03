import { IsString } from "class-validator";

class NewServerRequest {

  @IsString()
  name: string;

}

export default NewServerRequest;