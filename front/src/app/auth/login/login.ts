import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../auth';

@Component({
  selector: 'app-login',
  imports: [
    FormField,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly credentials = signal({
    email: '',
    password: '',
  });
  readonly loginForm = form(this.credentials, (path) => {
    required(path.email, { message: 'Ingresa tu correo electrónico.' });
    email(path.email, { message: 'Ingresa un correo electrónico válido.' });
    required(path.password, { message: 'Ingresa tu contraseña.' });
  });
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.errorMessage.set('');

    void submit(this.loginForm, async () => {
      this.isSubmitting.set(true);

      try {
        await firstValueFrom(this.authService.login(this.credentials()));
        await this.router.navigateByUrl(this.getReturnUrl(), { replaceUrl: true });
      } catch (error: unknown) {
        this.errorMessage.set(this.getErrorMessage(error));
      } finally {
        this.isSubmitting.set(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    return returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/home';
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No fue posible iniciar sesión. Inténtalo de nuevo.';
    }

    if (error.status === 0) {
      return 'No pudimos conectar con el servidor. Verifica que el back esté disponible.';
    }

    if (error.status === 401) {
      return 'El correo o la contraseña no son correctos.';
    }

    const backendMessage = error.error?.message as string | string[] | undefined;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join(' ');
    }

    return backendMessage ?? 'No fue posible iniciar sesión. Inténtalo de nuevo.';
  }
}
