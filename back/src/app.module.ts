import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ColoniasModule } from './colonias/colonias.module';

@Module({
  imports: [ColoniasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
