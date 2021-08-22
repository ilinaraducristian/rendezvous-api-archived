import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { KeycloakUser } from 'src/models/user.model';
import tokens from 'src/tokens';

@Controller('login')
export class AppController {

  @Get()
  login(@AuthenticatedUser() user: KeycloakUser): { token: string } {
    const token = uuid();
    tokens.push([token, user.sub]);
    return { token };
  }

}
