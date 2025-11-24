import { LoginComponent } from './views/users/login/login.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { RegisterComponent } from './views/users/register/register.component';
import { ProfileComponent } from './views/users/profile/profile.component';
import { RecoverComponent } from './views/users/recover/recover.component';
import { AdminComponent } from './views/users/admin/admin.component';
import { CreateLaboratoryComponent } from './views/laboratories/create-laboratory/create-laboratory.component';
import { ListLaboratoryComponent } from './views/laboratories/list-laboratory/list-laboratory.component';
import { EditLaboratoryComponent } from './views/laboratories/edit-laboratory/edit-laboratory.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },

  // ============================================================
  // RUTAS DE AUTENTICACIÓN
  // ============================================================
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recover', component: RecoverComponent },

  // ============================================================
  // PERFIL DEL USUARIO (Edición)
  // ============================================================
  {
    path: 'profile/:id',
    component: ProfileComponent,
    canActivate: [AuthGuard]      // requiere sesión activa
  },

  // ============================================================
  // LISTA DE USUARIOS (Solo ADMIN)
  // ============================================================
  {
    path: 'users',
    component: AdminComponent,
    canActivate: [AdminGuard]     // requiere ser ADMIN
  },

  // ============================================================
  // CRUD LABORATORIOS (Solo ADMIN)
  // ============================================================
  {
    path: 'laboratories',
    component: ListLaboratoryComponent,
    canActivate: [AdminGuard]      // ambos roles pueden ver libros
  },

  {
    path: 'laboratories/create',
    component: CreateLaboratoryComponent,
    canActivate: [AdminGuard]     // solo ADMIN puede crear
  },

  {
    path: 'laboratories/edit/:id',
    component: EditLaboratoryComponent,
    canActivate: [AdminGuard]     // solo ADMIN puede editar
  },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];