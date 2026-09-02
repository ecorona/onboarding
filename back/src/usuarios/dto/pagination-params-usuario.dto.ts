import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationParamsUsuarioDTO {
  @IsInt({
    message: 'page debe ser un número entero',
  })
  @Min(1, { message: 'page debe ser mínimo 1' })
  page: number;
  @IsInt({
    message: 'pageSize debe ser un número entero',
  })
  @Min(10, { message: 'pageSize debe ser mínimo 10' })
  @Max(100, { message: 'pageSize debe ser máximo 100' })
  pageSize: number;
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC';
  @IsIn(['id', 'nombre', 'email'])
  orderBy: 'id' | 'nombre' | 'email';

  @IsOptional()
  search: string;
}
