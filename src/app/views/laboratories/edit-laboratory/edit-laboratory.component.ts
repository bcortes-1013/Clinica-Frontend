import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from 'src/app/services/loading.service';
import { LaboratoriesService } from 'src/app/services/laboratories.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Laboratory } from 'src/app/models/laboratory';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-laboratory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-laboratory.component.html',
  styleUrls: ['./edit-laboratory.component.scss']
})
export class EditLaboratoryComponent {
  laboratory?: Laboratory;
  loading = true;
  mensajeError: string | null = null;
  mensajeOk: string | null = null;
  cargando = false;
  laboratoryId?: number; 

  private fb = inject(FormBuilder);
  private laboratoriesService = inject(LaboratoriesService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);


  constructor(
    private route: ActivatedRoute,
    private router: Router
    // private usersService: UsersService
  ) {}

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]]
  });

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.laboratoryId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.laboratoryId) {
      this.mensajeError = 'ID de usuario inválido';
      this.loading = false;
      return;
    }

    this.laboratoriesService.getById(this.laboratoryId).subscribe({
      next: (data) => { 
        this.laboratory = data; 
        this.loading = false; 

        this.form.patchValue({
          name: data.name,
          description: data.description,
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

    const payload: Partial<Laboratory> = {
      name: this.form.value.name ?? undefined,
      description: this.form.value.description ?? undefined,
      state: this.laboratory?.state
    };

    if (this.form.invalid) {
      this.mensajeError = 'Completa los campos requeridos';
      this.form.markAllAsTouched();
      this.loadingService.hide();
      return;
    }

    const { name, description } = this.form.value;
    if (!name || !description) {
      this.mensajeError = 'Nombre, email y contraseña son obligatorios';
      this.loadingService.hide();
      return;
    }

    this.cargando = true;

    this.laboratoriesService.update(this.laboratoryId!, payload).subscribe({
      next: () => {
        this.mensajeOk = 'Laboratorio actualizado correctamente';
        alert("Laboratorio actualizado correctamente");
        this.isAdmin ? this.router.navigate(['/laboratories']) : this.router.navigate(['/']);
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('❌ Error al actualizar laboratorio:', err);
        this.mensajeError = 'Error al actualizar laboratorio';
        this.loadingService.hide();
      }
    });
  }
}
