export interface User {
  id?: number;
  fullName: string;
  email: string;
  phone?: string | null;
  password?: string;
  rol: 'ADMIN' | 'TECNICO' | 'PACIENTE';
}