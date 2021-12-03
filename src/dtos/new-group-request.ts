import { IsString } from "class-validator";

class NewGroupRequest {

  @IsString()
  name: string;

}

export default NewGroupRequest;