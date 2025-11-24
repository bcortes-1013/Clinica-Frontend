import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';

/**
 * Componente para la gestión del panel de administración. Permite visualizar y ejecutar acciones con los usuarios.
 */

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class AdminComponent {
  users: User[] = [];
  loading = true;
  error = '';

  public auth = inject(AuthService);

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    this.usersService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios';
        this.loading = false;
      }
    });
  }

  deleteUser(id?: number): void {
    if (!id) return;
    const ok = confirm('¿Seguro que deseas eliminar este usuario?');
    if (!ok) return;

    this.usersService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(l => l.id !== id);
        alert('✅ Usuario eliminado correctamente');
      },
      error: () => {
        alert('No se pudo eliminar el usuario');
      }
    });
  }

  editProfile(id?: number): void {
    if (id !== undefined) {
      this.router.navigate(['/profile', id]);
    } else {
      console.warn('No hay ID para navegar');
    }
  }

  createUser(): void {
    this.router.navigate(['/register']);
  }
}