import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LaboratoriesService } from 'src/app/services/laboratories.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, RouterModule } from '@angular/router';
import { Laboratory } from 'src/app/models/laboratory';
import { SamplesService } from 'src/app/services/samples.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-create-sample',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-sample.component.html',
  styleUrls: ['./create-sample.component.scss']
})
export class CreateSampleComponent {
  private fb = inject(FormBuilder);
  private samplesService = inject(SamplesService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);

  mensajeError: string | null = null;
  mensajeOk: string | null = null;
  cargando = false;
  laboratories: Laboratory[] = [];
  loading = true;

  constructor(private laboratoriesService: LaboratoriesService, private router: Router) {}

  get isTechnician(): boolean {
    return this.authService.isTechnician();
  }

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    laboratory: [null as number | null, [Validators.required]]
  });

  ngOnInit(): void {
    this.laboratoriesService.getAll().subscribe({
      next: (data) => {
        this.laboratories = data;
        this.loading = false;
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar los laboratorios';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    const code = this.form.value.code || '';
    const description = this.form.value.description || '';
    this.loadingService.show();
    this.mensajeError = null;
    this.mensajeOk = null;
    this.cargando = true;

    if (this.form.invalid) {
      this.mensajeError = 'Completa los campos requeridos';
      this.form.markAllAsTouched();
      this.loadingService.hide();
      return;
    }

    this.samplesService.create({
      code,
      description,
      technician: this.authService.userActual?.fullName!,
      laboratory: this.laboratories.find(lab => lab.id === this.form.value.laboratory)?.name || ''

    }).subscribe({
      next: sample => {
        this.cargando = false;
        this.mensajeOk = `Se ha registrado la muestra ${sample.code} exitosamente`;
        this.loadingService.hide();
      },
      error: err => {
        this.cargando = false;
        console.error('Error en registro', err);
        this.mensajeError = 'No fue posible registrar el laboratorio. Verifique el código (No debe ser repetido)';
        this.loadingService.hide();
      }
    });
  }
}