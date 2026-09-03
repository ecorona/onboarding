import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioEntity } from './entities/usuario.entity.js';
import { Repository, UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { PaginationParamsUsuarioDTO } from './dto/pagination-params-usuario.dto.js';
import bcrypt from 'bcrypt';

export interface UsuariosPage {
  items: UsuarioEntity[];
  total: number;
}

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
    createUsuarioDto.email = createUsuarioDto.email.toLocaleLowerCase();
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
    hashedPassword: string,
    clearPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(clearPassword, hashedPassword);
  }

  async findAll(
    paginationParams: PaginationParamsUsuarioDTO,
  ): Promise<UsuariosPage> {
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
    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }

  async findOne(id: number): Promise<UsuarioEntity | null> {
    return this.repositorioUsuarios.findOne({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<UsuarioEntity | null> {
    return this.repositorioUsuarios.findOne({
      where: {
        email,
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
