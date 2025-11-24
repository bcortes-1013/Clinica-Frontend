import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { UsersService } from 'src/app/services/users.service';

/**
 * Componente para la recuperación de contraseña.
 */

@Component({
  selector: 'app-recover',
  standalone: true,
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class RecoverComponent {

  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private loadingService = inject(LoadingService);

  mensajeError: string | null = null;
  mensajeOk: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.mensajeError = 'Ingresa un correo válido';
      this.form.markAllAsTouched();
      return;
    }

    this.mensajeError = null;
    this.mensajeOk = null;
    this.loadingService.show();

    const email = this.form.get('email')?.value;

    if (!email) { // ⚠️ chequeo extra para TS
      this.mensajeError = 'El correo es obligatorio';
      this.loadingService.hide();
      return;
    }

    this.usersService.recoverByEmail(email).subscribe({
      next: (password) => {
        this.mensajeOk = `Contraseña provisoria: ${password}`;
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('❌ Error al buscar usuario:', err);
        this.mensajeError = 'Error al buscar el usuario';
        this.loadingService.hide();
      }
    });
  }
}