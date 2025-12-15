import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LaboratoriesService } from 'src/app/services/laboratories.service';
import { LoadingService } from 'src/app/services/loading.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-laboratory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-laboratory.component.html',
  styleUrls: ['./create-laboratory.component.scss']
})
export class CreateLaboratoryComponent {
  private fb = inject(FormBuilder);
  private laboratoriesService = inject(LaboratoriesService);
  private loadingService = inject(LoadingService);
  // private authService = inject(AuthService);

  mensajeError: string | null = null;
  mensajeOk: string | null = null;
  cargando = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
  });

  onSubmit(): void {
    this.loadingService.show();
    this.mensajeError = null;
    this.mensajeOk = null;
    const name = this.form.value.name || '';
    const description = this.form.value.description || '';

    if (this.form.invalid) {
      this.mensajeError = 'Completa los campos requeridos';
      this.form.markAllAsTouched();
      this.loadingService.hide();
      return;
    }

    this.cargando = true;

    this.laboratoriesService.create({
      name,
      description,
      state: 'ACTIVO'
    }).subscribe({
      next: laboratory => {
        this.cargando = false;
        this.mensajeOk = `Se ha registrado el laboratorio ${laboratory.name} exitosamente`;
        this.loadingService.hide();
      },
      error: err => {
        this.cargando = false;
        console.error('Error en registro', err);
        this.mensajeError = 'No fue posible registrar el laboratorio. Verifique el nombre (No puede ser repetido)';
        this.loadingService.hide();
      }
    });
  }
}
