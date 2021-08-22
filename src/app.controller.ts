import { Controller } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { v4 as uuid } from 'uuid';

@Controller('login')
export class AppController {

  constructor(private readonly appService: AppService) {
  }

  @Post()
  login(): string {
    console.log('it worked');
    const token = uuid();
    this.appService.addToken(token);
    return token;
  }

}
