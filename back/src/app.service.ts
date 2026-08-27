import { Injectable } from '@nestjs/common';
import { TituloResponse } from './dtos/titulo-response.dto.js';
import { PerfilDTO } from './dtos/perfil.dto.js';

@Injectable()
export class AppService {
  constructor() {}

  getTituloApp(): TituloResponse {
    return {
      titulo: 'Mi aplicación desde NestJS con api rest',
      fechaCreacion: new Date(),
    };
  }
  getPerfil(): PerfilDTO {
    return {
      id: 1,
      nombre: 'Erik E. Corona V.',
    };
  }

  guardarNombre(nombre: string) {
    //guardar el nombre
    return {
      id: 1,
      nombre: nombre,
    };
  }
}
