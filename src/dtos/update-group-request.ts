import { IsString } from "class-validator";

class UpdateGroupRequest {

  @IsString()
  name: string;

}

export default UpdateGroupRequest;