import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Usuarios } from './usuarios';
import { UsuariosApi } from './usuarios-api';

describe('Usuarios', () => {
  let fixture: ComponentFixture<Usuarios>;
  let component: Usuarios;
  let obtenerTodos: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    obtenerTodos = vi.fn(() => of({ items: [], total: 50 }));

    await TestBed.configureTestingModule({
      imports: [Usuarios],
      providers: [
        {
          provide: UsuariosApi,
          useValue: {
            obtenerTodos,
            crear: () => of({}),
            actualizar: () => of({}),
            eliminar: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Usuarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.inject(MatDialog).closeAll();
  });

  it('renders the Material table', () => {
    expect(fixture.nativeElement.querySelector('table[mat-table]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[mat-sort-header]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('mat-paginator')).toBeTruthy();
  });

  it('opens the create form in a Material dialog', async () => {
    component.abrirCrear();
    await fixture.whenStable();

    expect(document.querySelector('mat-dialog-container')).toBeTruthy();
    expect(document.body.textContent).toContain('Crear usuario');
  });

  it('consulta el orden y la página seleccionados en el servidor', async () => {
    component.onOrdenChange({ active: 'email', direction: 'desc' });
    await fixture.whenStable();

    expect(obtenerTodos).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 10,
      orderBy: 'email',
      order: 'DESC',
    });

    component.onPaginaChange({
      pageIndex: 1,
      pageSize: 25,
      length: 50,
      previousPageIndex: 0,
    });
    await fixture.whenStable();

    expect(obtenerTodos).toHaveBeenLastCalledWith({
      page: 2,
      pageSize: 25,
      orderBy: 'email',
      order: 'DESC',
    });
  });
});
