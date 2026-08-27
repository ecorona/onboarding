import { IsNotEmpty } from 'class-validator';

export class UpdateUsuarioDto {
  @IsNotEmpty({
    message: 'El nombre no puede estar vacío',
  })
  nombre: string;
}
