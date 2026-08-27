import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty({
    message: 'El nombre no puede estar vacío',
  })
  nombre: string;

  @IsEmail({}, { message: 'El correo no tiene el formato requerido' })
  email: string;

  @IsNotEmpty({
    message: 'El password no puede estar vacío',
  })
  @MinLength(10, {
    message: 'El password debe tener mínimo 10 caracteres',
  })
  password: string;
}
