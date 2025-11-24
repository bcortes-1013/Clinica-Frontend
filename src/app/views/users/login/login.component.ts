import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';

/**
 * Componente de autenticación que permite a los usuarios iniciar sesión en el sistema.
 */

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  mensajeError: string | null = null;
  cargando = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  // -----------------------------------------------------------
  // Enviar formulario
  // -----------------------------------------------------------
  onSubmit(): void {
    this.loadingService.show();
    this.mensajeError = null;

    if (this.form.invalid) {
      this.mensajeError = 'Completa el formulario';
      this.form.markAllAsTouched();
      this.loadingService.hide();
      return;
    }

    const { email, password } = this.form.value;
    if (!email || !password) {
      this.mensajeError = 'Email y contraseña obligatorios';
      this.loadingService.hide();
      return;
    }

    this.cargando = true;

    this.usersService.login(email, password).subscribe({
      next: usuario => {
        this.cargando = false;
        // Guardamos usuario en AuthService (y LocalStorage)
        this.authService.login(usuario);
        this.router.navigate(['/']);
        this.loadingService.hide();
      },
      error: err => {
        this.cargando = false;
        console.error('Error en login', err);
        if (err.status === 0) {
          this.mensajeError = 'Error en la conexión, intenta más tarde';
          return;
        } else {
          this.mensajeError = err.error?.error || 'Error en el servidor';
        }
        this.loadingService.hide();
      }
    });
  }
}