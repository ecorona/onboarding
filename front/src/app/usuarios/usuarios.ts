import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
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
import { SortOrder, Usuario, UsuarioOrderBy, UsuariosApi, UsuariosQuery } from './usuarios-api';

interface FiltrosUsuarios {
  search: string;
  pageSize: string;
  orderBy: UsuarioOrderBy;
  order: SortOrder;
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

@Component({
  selector: 'app-usuarios',
  imports: [FormField],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Usuarios implements OnInit {
  private readonly usuariosApi = inject(UsuariosApi);

  readonly usuarios = signal<Usuario[]>([]);
  readonly pagina = signal(1);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly eliminando = signal(false);
  readonly errorCarga = signal('');
  readonly errorFormulario = signal('');
  readonly mensajeExito = signal('');
  readonly modal = signal<ModalUsuario>(null);
  readonly usuarioEditandoId = signal<number | null>(null);
  readonly usuarioAEliminar = signal<Usuario | null>(null);
  readonly mostrarPassword = signal(false);

  readonly filtrosModel = signal<FiltrosUsuarios>({
    search: '',
    pageSize: '10',
    orderBy: 'id',
    order: 'ASC',
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

  readonly hayPaginaSiguiente = computed(
    () => this.usuarios().length === this.filtrosAplicados().pageSize,
  );

  ngOnInit(): void {
    void this.cargarUsuarios();
  }

  onFiltrosSubmit(event: SubmitEvent): void {
    event.preventDefault();

    void submit(this.filtrosForm, async () => {
      const filtros = this.filtrosModel();
      const search = filtros.search.trim();

      this.filtrosAplicados.set({
        pageSize: Number(filtros.pageSize),
        orderBy: filtros.orderBy,
        order: filtros.order,
        ...(search ? { search } : {}),
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

  irPaginaAnterior(): void {
    if (this.pagina() === 1 || this.cargando()) {
      return;
    }

    this.pagina.update((pagina) => pagina - 1);
    void this.cargarUsuarios();
  }

  irPaginaSiguiente(): void {
    if (!this.hayPaginaSiguiente() || this.cargando()) {
      return;
    }

    this.pagina.update((pagina) => pagina + 1);
    void this.cargarUsuarios();
  }

  abrirCrear(): void {
    this.errorFormulario.set('');
    this.mostrarPassword.set(false);
    this.crearForm().reset({ nombre: '', email: '', password: '' });
    this.modal.set('crear');
  }

  abrirEditar(usuario: Usuario): void {
    this.errorFormulario.set('');
    this.usuarioEditandoId.set(usuario.id);
    this.editarForm().reset({ nombre: usuario.nombre });
    this.modal.set('editar');
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }

    this.modal.set(null);
    this.usuarioEditandoId.set(null);
    this.errorFormulario.set('');
  }

  onCrearSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.errorFormulario.set('');

    void submit(this.crearForm, async () => {
      this.guardando.set(true);

      try {
        await firstValueFrom(this.usuariosApi.crear(this.crearModel()));
        this.modal.set(null);
        this.mensajeExito.set('Usuario creado correctamente.');
        this.pagina.set(1);
        await this.cargarUsuarios(true);
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
        this.modal.set(null);
        this.usuarioEditandoId.set(null);
        this.mensajeExito.set('Usuario actualizado correctamente.');
        await this.cargarUsuarios(true);
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
  }

  cancelarEliminar(): void {
    if (!this.eliminando()) {
      this.usuarioAEliminar.set(null);
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
      this.usuarioAEliminar.set(null);
      this.mensajeExito.set('Usuario eliminado correctamente.');
      await this.cargarUsuarios(true);
    } catch (error: unknown) {
      this.usuarioAEliminar.set(null);
      this.errorCarga.set(this.obtenerMensajeError(error, 'No fue posible eliminar el usuario.'));
    } finally {
      this.eliminando.set(false);
    }
  }

  togglePassword(): void {
    this.mostrarPassword.update((mostrar) => !mostrar);
  }

  cerrarMensajeExito(): void {
    this.mensajeExito.set('');
  }

  reintentar(): void {
    void this.cargarUsuarios();
  }

  private async cargarUsuarios(conservarMensaje = false): Promise<void> {
    this.cargando.set(true);
    this.errorCarga.set('');

    if (!conservarMensaje) {
      this.mensajeExito.set('');
    }

    try {
      let usuarios = await firstValueFrom(
        this.usuariosApi.obtenerTodos({ page: this.pagina(), ...this.filtrosAplicados() }),
      );

      if (usuarios.length === 0 && this.pagina() > 1) {
        this.pagina.update((pagina) => pagina - 1);
        usuarios = await firstValueFrom(
          this.usuariosApi.obtenerTodos({ page: this.pagina(), ...this.filtrosAplicados() }),
        );
      }

      this.usuarios.set(usuarios);
    } catch (error: unknown) {
      this.errorCarga.set(this.obtenerMensajeError(error, 'No fue posible cargar los usuarios.'));
    } finally {
      this.cargando.set(false);
    }
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
