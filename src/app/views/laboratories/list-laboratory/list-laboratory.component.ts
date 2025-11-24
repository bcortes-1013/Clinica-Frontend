import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Laboratory } from 'src/app/models/laboratory';
// import { AuthService } from 'src/app/services/auth.service';
import { LaboratoriesService } from 'src/app/services/laboratories.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-laboratory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-laboratory.component.html',
  styleUrls: ['./list-laboratory.component.scss']
})
export class ListLaboratoryComponent {
  laboratories: Laboratory[] = [];
  loading = true;
  error = '';

  // public auth = inject(AuthService);

  constructor(private laboratoriesService: LaboratoriesService, private router: Router) {}

  ngOnInit(): void {
    this.laboratoriesService.getAll().subscribe({
      next: (data) => {
        this.laboratories = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios';
        this.loading = false;
      }
    });
  }

  deleteLaboratory(id?: number): void {
    if (!id) return;
    const ok = confirm('¿Seguro que deseas eliminar este laboratorio?');
    if (!ok) return;

    this.laboratoriesService.delete(id).subscribe({
      next: () => {
        this.laboratories = this.laboratories.filter(l => l.id !== id);
        alert('✅ Laboratorio eliminado correctamente');
      },
      error: () => {
        alert('No se pudo eliminar el laboratorio');
      }
    });
  }

  editProfile(id?: number): void {
    if (id !== undefined) {
      this.router.navigate(['/laboratories/edit', id]);
    } else {
      console.warn('No hay ID para navegar');
    }
  }

  createLaboratory(): void {
    this.router.navigate(['/laboratories/create']);
  }
}
