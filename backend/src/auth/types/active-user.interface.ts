export interface ActiveUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
