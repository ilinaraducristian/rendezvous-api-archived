import { IsDecimal, IsNumber, Min, ValidateIf } from "class-validator";
import { IsNotBlank } from "../IsNotBlank";

class UpdateServerRequest {

  @ValidateIf((_, val) => val !== undefined)
  @IsNotBlank()
  name?: string;

  @ValidateIf((_, val) => val !== undefined)
  @IsNumber()
  @IsDecimal()
  @Min(0)
  order?: number;

}

export default UpdateServerRequest;