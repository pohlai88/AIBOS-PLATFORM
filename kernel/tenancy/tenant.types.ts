export interface Tenant {
  id: string;
  name: string;
  engines: string[];
  plan: string;
  roles: Record<string, string[]>; // role => permissions
}
