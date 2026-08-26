import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { TituloResponse } from './dtos/titulo-response.dto';
import { PerfilDTO } from './dtos/perfil.dto';

@Controller('app') // ruta: /app
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('titulo') // GET /app/titulo
  getHello(): TituloResponse {
    return this.appService.getTituloApp();
  }

  @Get('perfil')
  getHola(): PerfilDTO {
    return this.appService.getPerfil();
  }

  @Post('guardar-nombre') // POST /app/guardar-nombre {nombre: string}
  // body: {nombre:valor}
  guardarNombre(@Body('nombre') nombre: string) {
    if (!nombre) {
      return new HttpException(
        'El nombre es requerido',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (nombre.length < 5) {
      return new HttpException(
        'El nombre no puede tener menos de 5 caracteres',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (nombre.length > 20) {
      return new HttpException(
        'El nombre no puede tener mas de 20 caracteres',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.appService.guardarNombre(nombre);
  }
}

/*
Usuario(Angular) -> 
  Infraestructura(Controllers) Rutas del api
    Validacion de entradas
    Servicios(Services) Impresion, Manipulacion de archivos, apis/servicios de terceros
      Dominio(Repositorios/Entidades) Base de datos
**/
