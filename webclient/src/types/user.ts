export interface User {
  id: number;
  name: string;
  account: string;
  admin_level: number;
  from: 'github' | 'gitlab';
  is_admin?: boolean;
  is_super_admin?: boolean;
}
