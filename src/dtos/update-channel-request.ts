import { IsString } from "class-validator";

class UpdateChannelRequest {

  @IsString()
  name: string;

}

export default UpdateChannelRequest;