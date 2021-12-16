import { IsEnum } from "class-validator";
import ChannelType from "./channel-type";
import { IsNotBlank } from "../IsNotBlank";

class NewChannelRequest {

  @IsNotBlank()
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

}

export default NewChannelRequest;