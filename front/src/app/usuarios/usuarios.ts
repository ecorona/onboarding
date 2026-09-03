import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  email,
  form,
  FormField,
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorIntl, MatPaginatorModule, type PageEvent } from '@angular/material/paginator';
import { MatSortModule, type Sort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { type Usuario, type UsuarioOrderBy, UsuariosApi, type UsuariosQuery } from './usuarios-api';

interface FiltrosUsuarios {
  search: string;
}

interface CrearUsuarioForm {
  nombre: string;
  email: string;
  password: string;
}

interface EditarUsuarioForm {
  nombre: string;
}

type ModalUsuario = 'crear' | 'editar' | null;

function crearPaginadorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();

  intl.itemsPerPageLabel = 'Usuarios por página:';
  intl.firstPageLabel = 'Primera página';
  intl.previousPageLabel = 'Página anterior';
  intl.nextPageLabel = 'Página siguiente';
  intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const inicio = page * pageSize;
    const fin = Math.min(inicio + pageSize, length);
    return `${inicio + 1} – ${fin} de ${length}`;
  };

  return intl;
}

@Component({
  selector: 'app-usuarios',
  imports: [
    FormField,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useFactory: crearPaginadorIntl }],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Usuarios implements OnInit {
  private readonly usuariosApi = inject(UsuariosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private formDialogRef: MatDialogRef<unknown> | null = null;
  private deleteDialogRef: MatDialogRef<unknown> | null = null;

  readonly usuarioFormDialog = viewChild.required<TemplateRef<unknown>>('usuarioFormDialog');
  readonly eliminarUsuarioDialog =
    viewChild.required<TemplateRef<unknown>>('eliminarUsuarioDialog');
  readonly displayedColumns = ['id', 'nombre', 'email', 'estado', 'emailValidated', 'acciones'];

  readonly usuarios = signal<Usuario[]>([]);
  readonly totalUsuarios = signal(0);
  readonly pagina = signal(1);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly eliminando = signal(false);
  readonly errorCarga = signal('');
  readonly errorFormulario = signal('');
  readonly modal = signal<ModalUsuario>(null);
  readonly usuarioEditandoId = signal<number | null>(null);
  readonly usuarioAEliminar = signal<Usuario | null>(null);
  readonly mostrarPassword = signal(false);

  readonly filtrosModel = signal<FiltrosUsuarios>({
    search: '',
  });
  readonly filtrosForm = form(this.filtrosModel);
  readonly filtrosAplicados = signal<Omit<UsuariosQuery, 'page'>>({
    pageSize: 10,
    orderBy: 'id',
    order: 'ASC',
  });

  readonly crearModel = signal<CrearUsuarioForm>({ nombre: '', email: '', password: '' });
  readonly crearForm = form(this.crearModel, (path) => {
    required(path.nombre, { message: 'Ingresa el nombre del usuario.' });
    required(path.email, { message: 'Ingresa el correo electrónico.' });
    email(path.email, { message: 'Ingresa un correo electrónico válido.' });
    required(path.password, { message: 'Ingresa una contraseña.' });
    minLength(path.password, 8, { message: 'La contraseña debe tener al menos 8 caracteres.' });
    pattern(path.password, /[a-z]/, { message: 'Agrega al menos una letra minúscula.' });
    pattern(path.password, /[A-Z]/, { message: 'Agrega al menos una letra mayúscula.' });
    pattern(path.password, /[0-9]/, { message: 'Agrega al menos un número.' });
    pattern(path.password, /[^A-Za-z0-9]/, { message: 'Agrega al menos un símbolo.' });
  });

  readonly editarModel = signal<EditarUsuarioForm>({ nombre: '' });
  readonly editarForm = form(this.editarModel, (path) => {
    required(path.nombre, { message: 'Ingresa el nombre del usuario.' });
  });

  ngOnInit(): void {
    void this.cargarUsuarios();
  }

  onFiltrosSubmit(event: SubmitEvent): void {
    event.preventDefault();

    void submit(this.filtrosForm, async () => {
      const filtros = this.filtrosModel();
      const search = filtros.search.trim();

      this.filtrosAplicados.set({
        ...this.filtrosAplicados(),
        search: search || undefined,
      });
      this.pagina.set(1);
      await this.cargarUsuarios();
    });
  }

  limpiarBusqueda(): void {
    this.filtrosForm().reset({ ...this.filtrosModel(), search: '' });
    this.filtrosAplicados.update(({ search: _search, ...filtros }) => filtros);
    this.pagina.set(1);
    void this.cargarUsuarios();
  }

  onOrdenChange(sort: Sort): void {
    if (this.cargando() || !this.esUsuarioOrderBy(sort.active) || sort.direction === '') {
      return;
    }

    const orderBy = sort.active;
    this.filtrosAplicados.update((filtros) => ({
      ...filtros,
      orderBy,
      order: sort.direction === 'asc' ? 'ASC' : 'DESC',
    }));
    this.pagina.set(1);
    void this.cargarUsuarios();
  }

  onPaginaChange(event: PageEvent): void {
    if (this.cargando()) {
      return;
    }

    this.filtrosAplicados.update((filtros) => ({
      ...filtros,
      pageSize: event.pageSize,
    }));
    this.pagina.set(event.pageIndex + 1);
    void this.cargarUsuarios();
  }

  abrirCrear(): void {
    this.errorFormulario.set('');
    this.mostrarPassword.set(false);
    this.crearForm().reset({ nombre: '', email: '', password: '' });
    this.modal.set('crear');
    this.abrirFormularioDialog();
  }

  abrirEditar(usuario: Usuario): void {
    this.errorFormulario.set('');
    this.usuarioEditandoId.set(usuario.id);
    this.editarForm().reset({ nombre: usuario.nombre });
    this.modal.set('editar');
    this.abrirFormularioDialog();
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }

    this.formDialogRef?.close();
  }

  onCrearSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.errorFormulario.set('');

    void submit(this.crearForm, async () => {
      this.guardando.set(true);

      try {
        await firstValueFrom(this.usuariosApi.crear(this.crearModel()));
        this.formDialogRef?.close();
        this.mostrarExito('Usuario creado correctamente.');
        this.pagina.set(1);
        await this.cargarUsuarios();
      } catch (error: unknown) {
        this.errorFormulario.set(
          this.obtenerMensajeError(error, 'No fue posible crear el usuario.'),
        );
      } finally {
        this.guardando.set(false);
      }
    });
  }

  onEditarSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.errorFormulario.set('');

    void submit(this.editarForm, async () => {
      const id = this.usuarioEditandoId();

      if (id === null) {
        return;
      }

      this.guardando.set(true);

      try {
        await firstValueFrom(this.usuariosApi.actualizar(id, this.editarModel()));
        this.formDialogRef?.close();
        this.mostrarExito('Usuario actualizado correctamente.');
        await this.cargarUsuarios();
      } catch (error: unknown) {
        this.errorFormulario.set(
          this.obtenerMensajeError(error, 'No fue posible actualizar el usuario.'),
        );
      } finally {
        this.guardando.set(false);
      }
    });
  }

  solicitarEliminar(usuario: Usuario): void {
    this.usuarioAEliminar.set(usuario);
    this.deleteDialogRef = this.dialog.open(this.eliminarUsuarioDialog(), {
      autoFocus: false,
      disableClose: true,
      maxWidth: '28rem',
      width: 'calc(100vw - 2rem)',
    });
    this.deleteDialogRef.afterClosed().subscribe(() => {
      this.deleteDialogRef = null;
      this.usuarioAEliminar.set(null);
    });
  }

  cancelarEliminar(): void {
    if (!this.eliminando()) {
      this.deleteDialogRef?.close();
    }
  }

  async confirmarEliminar(): Promise<void> {
    const usuario = this.usuarioAEliminar();

    if (!usuario || this.eliminando()) {
      return;
    }

    this.eliminando.set(true);
    this.errorCarga.set('');

    try {
      await firstValueFrom(this.usuariosApi.eliminar(usuario.id));
      this.deleteDialogRef?.close();
      this.mostrarExito('Usuario eliminado correctamente.');
      await this.cargarUsuarios();
    } catch (error: unknown) {
      this.deleteDialogRef?.close();
      this.errorCarga.set(this.obtenerMensajeError(error, 'No fue posible eliminar el usuario.'));
    } finally {
      this.eliminando.set(false);
    }
  }

  togglePassword(): void {
    this.mostrarPassword.update((mostrar) => !mostrar);
  }

  reintentar(): void {
    void this.cargarUsuarios();
  }

  private abrirFormularioDialog(): void {
    this.formDialogRef = this.dialog.open(this.usuarioFormDialog(), {
      autoFocus: 'first-tabbable',
      maxWidth: '32rem',
      restoreFocus: true,
      width: 'calc(100vw - 2rem)',
    });
    this.formDialogRef.afterClosed().subscribe(() => {
      this.formDialogRef = null;
      this.modal.set(null);
      this.usuarioEditandoId.set(null);
      this.errorFormulario.set('');
    });
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4500 });
  }

  private async cargarUsuarios(): Promise<void> {
    this.cargando.set(true);
    this.errorCarga.set('');

    try {
      let respuesta = await firstValueFrom(
        this.usuariosApi.obtenerTodos({ page: this.pagina(), ...this.filtrosAplicados() }),
      );
      const ultimaPagina = Math.max(
        1,
        Math.ceil(respuesta.total / this.filtrosAplicados().pageSize),
      );

      if (this.pagina() > ultimaPagina) {
        this.pagina.set(ultimaPagina);
        respuesta = await firstValueFrom(
          this.usuariosApi.obtenerTodos({ page: this.pagina(), ...this.filtrosAplicados() }),
        );
      }

      this.usuarios.set(respuesta.items);
      this.totalUsuarios.set(respuesta.total);
    } catch (error: unknown) {
      this.errorCarga.set(this.obtenerMensajeError(error, 'No fue posible cargar los usuarios.'));
    } finally {
      this.cargando.set(false);
    }
  }

  private esUsuarioOrderBy(value: string): value is UsuarioOrderBy {
    return value === 'id' || value === 'nombre' || value === 'email';
  }

  private obtenerMensajeError(error: unknown, mensajePredeterminado: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return mensajePredeterminado;
    }

    if (error.status === 0) {
      return 'No pudimos conectar con el servidor. Verifica que el back esté disponible.';
    }

    const mensajeBackend = error.error?.message as string | string[] | undefined;

    if (Array.isArray(mensajeBackend)) {
      return mensajeBackend.join(' ');
    }

    return mensajeBackend ?? mensajePredeterminado;
  }
}
