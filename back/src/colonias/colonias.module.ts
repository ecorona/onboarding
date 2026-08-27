import { Module } from '@nestjs/common';
import { ColoniasController } from './colonias.controller.js';
import { ColoniasService } from './colonias.service.js';

@Module({
  controllers: [ColoniasController],
  providers: [ColoniasService]
})
export class ColoniasModule {}
