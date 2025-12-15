import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sample } from 'src/app/models/sample';
import { SamplesService } from 'src/app/services/samples.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-sample',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-sample.component.html',
  styleUrls: ['./list-sample.component.scss']
})
export class ListSampleComponent {
  samples: Sample[] = [];
  loading = true;
  error = '';

  constructor(private samplesService: SamplesService, private router: Router) {}

  ngOnInit(): void {
    this.samplesService.getAll().subscribe({
      next: (data) => {
        this.samples = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las muestras';
        this.loading = false;
      }
    });
  }

  deleteSample(id?: number): void {
    if (!id) return;
    const ok = confirm('¿Seguro que deseas eliminar esta muestra?');
    if (!ok) return;

    this.samplesService.delete(id).subscribe({
      next: () => {
        this.samples = this.samples.filter(l => l.id !== id);
        alert('✅ Muestra eliminada correctamente');
      },
      error: () => {
        alert('No se pudo eliminar la muestra');
      }
    });
  }

  editSample(id?: number): void {
    if (id !== undefined) {
      this.router.navigate(['/samples/edit', id]);
    } else {
      console.warn('No hay ID para navegar');
    }
  }

  createSample(): void {
    this.router.navigate(['/samples/create']);
  }
}