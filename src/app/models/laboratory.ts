export interface Laboratory {
  id?: number;
  name: string;
  description: string;
  state: 'ACTIVO' | 'INACTIVO';
}