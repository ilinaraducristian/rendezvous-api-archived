import { IsString } from "class-validator";

class UpdateServerResponse {

  @IsString()
  name: string;

}

export default UpdateServerResponse;