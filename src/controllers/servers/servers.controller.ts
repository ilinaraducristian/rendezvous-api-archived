import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from '../../app.service';
import { AuthenticatedUser } from 'nest-keycloak-connect';

@Controller('servers')
export class ServersController {

  constructor(private readonly appService: AppService) {
  }

  @Post()
  async createServer(
    @AuthenticatedUser() user: any,
    @Body("name") name: string
  ): Promise<any> {
    return this.appService.createServer(user.sub, name);
  }

}

