import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { UsuarioEntity } from './entities/usuario.entity.js';
import { DeleteResult, UpdateResult } from 'typeorm';
import { PaginationParamsUsuarioDTO } from './dto/pagination-params-usuario.dto.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<UsuarioEntity> {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll(
    @Query() paginationParams: PaginationParamsUsuarioDTO,
  ): Promise<Array<UsuarioEntity>> {
    return this.usuariosService.findAll(paginationParams);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UsuarioEntity | null> {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UpdateResult> {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return this.usuariosService.remove(id);
  }
}
