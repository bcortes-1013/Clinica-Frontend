import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { LoadingService } from '../../../services/loading.service';
import { AuthService } from 'src/app/services/auth.service';

/**
  * Componente para el registro de nuevos tecnicos en el sistema.
  */

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);

  mensajeError: string | null = null;
  mensajeOk: string | null = null;
  cargando = false;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password2: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.minLength(9), Validators.maxLength(9)]]
  });

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  onSubmit(): void {
    this.loadingService.show();
    this.mensajeError = null;
    this.mensajeOk = null;

    if (this.form.invalid) {
      this.mensajeError = 'Completa los campos requeridos';
      this.form.markAllAsTouched();
      this.loadingService.hide();
      return;
    }

    const { fullName, email, password, phone } = this.form.value;
    if (!fullName || !email || !password) {
      this.mensajeError = 'Nombre, email y contraseña son obligatorios';
      this.loadingService.hide();
      return;
    }

    this.cargando = true;

    this.usersService.register({
      fullName,
      email,
      password,
      phone: phone || '',
      rol: this.isAdmin ? 'TECNICO' : 'PACIENTE'
    }).subscribe({
      next: usuario => {
        this.cargando = false;
        this.mensajeOk = this.isAdmin ? `Se ha registrado el Técnico exitosamente` : `Te has registrado correctamente. Ahora puedes iniciar sesión`;
        this.loadingService.hide();
      },
      error: err => {
        this.cargando = false;
        console.error('Error en registro', err);
        this.mensajeError = 'No fue posible registrar el usuario. Verifique el email (no repetido)';
        this.loadingService.hide();
      }
    });
  }

  checkSamePasswords(pass1: string, pass2: string) {
    return (formGroup: FormGroup) => {
      const p1 = formGroup.get(pass1);
      const p2 = formGroup.get(pass2);

      if (p1?.value !== p2?.value) {
        p2?.setErrors({ ...p2.errors, contrasenasNoCoinciden: true });
      } else {
        // Si había otros errores, los conservamos
        if (p2?.errors) {
          delete p2.errors['contrasenasNoCoinciden'];
          if (Object.keys(p2.errors).length === 0) {
            p2.setErrors(null);
          }
        }
      }
    };
  }
}