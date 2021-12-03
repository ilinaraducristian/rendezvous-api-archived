import { IsString } from "class-validator";

class UpdateServerRequest {

  @IsString()
  name: string;

}

export default UpdateServerRequest;