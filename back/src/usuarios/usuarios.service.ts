import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioEntity } from './entities/usuario.entity.js';
import { Repository, UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { PaginationParamsUsuarioDTO } from './dto/pagination-params-usuario.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly repositorioUsuarios: Repository<UsuarioEntity>,
  ) {}
  async create(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioEntity> {
    //hashear la contraseña del usuario
    createUsuarioDto.password = await this.hashPassword(
      createUsuarioDto.password,
    );
    return this.repositorioUsuarios.save(createUsuarioDto);
  }

  private async hashPassword(clearPassword: string): Promise<string> {
    // Implementa aquí la lógica para hashear la contraseña
    // Por ejemplo, puedes usar bcrypt o cualquier otra librería de hashing
    const saltOrRounds = 10;
    const password = clearPassword;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash; // Esto es solo un ejemplo, no es seguro
  }

  async passwordValido(
    usuarioId: number,
    clearPassword: string,
  ): Promise<boolean> {
    const usuario = await this.repositorioUsuarios.findOne({
      where: {
        id: usuarioId,
      },
    });
    if (!usuario) {
      return false;
    }
    return await bcrypt.compare(clearPassword, usuario.password);
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
