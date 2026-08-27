import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuarios')
export class UsuarioEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  nombre: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
  })
  activo: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  emailValidated: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  emailValidationToken: string;
}
