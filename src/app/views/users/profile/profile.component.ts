import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UsersService } from 'src/app/services/users.service';

/**
 * Componente que muestra y permite editar la información del perfil del tecnico.
 */

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class ProfileComponent {

  user?: User;
  loading = true;
  mensajeError: string | null = null;
  mensajeOk: string | null = null;
  cargando = false;
  userId?: number; 

  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);


  constructor(
    private route: ActivatedRoute,
    private router: Router
    // private usersService: UsersService
  ) {}

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.minLength(9), Validators.maxLength(9)]]
  });

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.userId) {
      this.mensajeError = 'ID de usuario inválido';
      this.loading = false;
      return;
    }

    this.usersService.getById(this.userId).subscribe({
      next: (data) => { 
        this.user = data; 
        this.loading = false; 

        this.form.patchValue({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone
        });
      },
      error: (err) => {
        this.mensajeError = 'No se pudo obtener el usuario';
        this.loading = false;
        console.error('❌ Error al obtener usuario por ID:', err);
      }
    });
  }

  onSubmit(): void {
    this.loadingService.show();
    this.mensajeError = null;
    this.mensajeOk = null;

    const payload: Partial<User> = {
      fullName: this.form.value.fullName ?? undefined,
      email: this.form.value.email ?? undefined,
      phone: this.form.value.phone ?? undefined,
      rol: this.user?.rol
    };

    if (this.form.invalid) {
      this.mensajeError = 'Completa los campos requeridos';
      this.form.markAllAsTouched();
      this.loadingService.hide();
      return;
    }

    const { fullName, email } = this.form.value;
    if (!fullName || !email) {
      this.mensajeError = 'Nombre, email y contraseña son obligatorios';
      this.loadingService.hide();
      return;
    }

    this.cargando = true;

    this.usersService.updateProfile(this.userId!, payload).subscribe({
      next: () => {
        this.mensajeOk = 'Usuario actualizado correctamente';
        alert("Usuario actualizado correctamente");
        this.isAdmin ? this.router.navigate(['/admin']) : this.router.navigate(['/']);
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('❌ Error al actualizar usuario:', err);
        this.mensajeError = 'Error al actualizar el usuario';
        this.loadingService.hide();
      }
    });
  }
}