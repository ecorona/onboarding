import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ColoniasModule } from './colonias/colonias.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'myuser',
      password: 'mypassword',
      database: 'mydatabase',
      entities: [],
      synchronize: true,
    }),
    ColoniasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
