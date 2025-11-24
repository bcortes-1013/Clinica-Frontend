import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

  /**
   * Barra de navegación principal del sitio, con acceso a distintas secciones como login, home y carrito.
   */

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  get isLogged(): boolean {
    return this.authService.isLogged();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isTechnician(): boolean {
    return this.authService.isTechnician();
  }

  get fullName(): string {
    return this.authService.userActual?.fullName ?? '';
  }

  get rol(): string {
    return this.authService.userActual?.rol ?? '';
  }

  get userId(): Number | null {
    return this.authService.userActual?.id ?? 0;
  }
  

  // -------------------------------------------------------------
  // Cerrar sesión, eliminar cookie y redirigir
  // -------------------------------------------------------------
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}