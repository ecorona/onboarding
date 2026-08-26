import { Module } from '@nestjs/common';
import { ColoniasController } from './colonias.controller';
import { ColoniasService } from './colonias.service';

@Module({
  controllers: [ColoniasController],
  providers: [ColoniasService]
})
export class ColoniasModule {}
