import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

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
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message(validationArguments) {
        return `La contraseña debe tener al menos ${validationArguments.constraints[0]} caracteres e incluir al menos una letra minúscula, una letra mayúscula, un número y un símbolo.`;
      },
    },
  )
  password: string;
}
