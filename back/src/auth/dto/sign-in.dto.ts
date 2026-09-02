import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsEmail(
    {},
    {
      message: 'El correo electrónico no es válido',
    },
  )
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
