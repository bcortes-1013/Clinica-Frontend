import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from 'src/app/services/loading.service';
import { SamplesService } from 'src/app/services/samples.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sample } from 'src/app/models/sample';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-sample',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-sample.component.html',
  styleUrls: ['./edit-sample.component.scss']
})
export class EditSampleComponent {
  sample?: Sample;
  loading = true;
  mensajeError: string | null = null;
  mensajeOk: string | null = null;
  cargando = false;
  sampleId?: number; 

  private fb = inject(FormBuilder);
  private samplesService = inject(SamplesService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);


  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
  });

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.sampleId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.sampleId) {
      this.mensajeError = 'ID de muestra inválida';
      this.loading = false;
      return;
    }

    this.samplesService.getById(this.sampleId).subscribe({
      next: (data) => { 
        this.sample = data; 
        this.loading = false; 

        this.form.patchValue({
          code: data.code,
          description: data.description
          // laboratory: data.laboratory,
          // technician: data.technician
        });
      },
      error: (err) => {
        this.mensajeError = 'No se pudo obtener la muestra';
        this.loading = false;
        console.error('❌ Error al obtener muestra por ID:', err);
      }
    });
  }

  onSubmit(): void {
    this.loadingService.show();
    this.mensajeError = null;
    this.mensajeOk = null;

    const payload: Partial<Sample> = {
      code: this.form.value.code ?? undefined,
      description: this.form.value.description ?? undefined,
    };

    if (this.form.invalid) {
      this.mensajeError = 'Completa los campos requeridos';
      this.form.markAllAsTouched();
      this.loadingService.hide();
      return;
    }

    this.cargando = true;

    this.samplesService.update(this.sampleId!, payload).subscribe({
      next: () => {
        this.mensajeOk = 'Muestra actualizada correctamente';
        alert("Muestra actualizada correctamente");
        this.isAdmin ? this.router.navigate(['/samples']) : this.router.navigate(['/']);
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('❌ Error al actualizar muestra:', err);
        this.mensajeError = 'Error al actualizar muestra';
        this.loadingService.hide();
      }
    });
  }
}