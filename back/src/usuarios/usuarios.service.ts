import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioEntity } from './entities/usuario.entity.js';
import { Repository, UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { PaginationParamsUsuarioDTO } from './dto/pagination-params-usuario.dto.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly repositorioUsuarios: Repository<UsuarioEntity>,
  ) {}
  async create(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioEntity> {
    return this.repositorioUsuarios.save(createUsuarioDto);
  }

  async findAll(
    paginationParams: PaginationParamsUsuarioDTO,
  ): Promise<Array<UsuarioEntity>> {
    const qb = this.repositorioUsuarios.createQueryBuilder();
    qb.skip((paginationParams.page - 1) * paginationParams.pageSize).take(
      paginationParams.pageSize,
    );
    if (paginationParams.orderBy) {
      qb.orderBy(paginationParams.orderBy, paginationParams.order);
    }
    if (paginationParams.search) {
      qb.where('nombre LIKE :search OR email LIKE :search', {
        search: `%${paginationParams.search}%`,
      });
    }
    return qb.getMany();
  }

  async findOne(id: number): Promise<UsuarioEntity | null> {
    return this.repositorioUsuarios.findOne({
      where: {
        id,
      },
    });
  }

  update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UpdateResult> {
    return this.repositorioUsuarios.update(id, {
      nombre: updateUsuarioDto.nombre,
    });
  }

  remove(id: number): Promise<DeleteResult> {
    return this.repositorioUsuarios.delete(id);
  }
}
