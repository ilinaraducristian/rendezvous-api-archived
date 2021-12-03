import { IsEnum, IsString } from "class-validator";
import ChannelType from "./channel-type";

class NewChannelRequest {

  @IsString()
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

}

export default NewChannelRequest;