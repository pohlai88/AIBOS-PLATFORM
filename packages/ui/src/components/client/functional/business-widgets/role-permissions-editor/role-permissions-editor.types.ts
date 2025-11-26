/**
 * RolePermissionsEditor Types - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface RolePermissionsEditorProps {
  roles: Role[];
  permissions: Permission[];
  selectedRoleId?: string;
  onRoleSelect: (roleId: string) => void;
  onPermissionToggle: (roleId: string, permissionId: string, granted: boolean) => void;
  onRoleCreate?: (name: string, description?: string) => void;
  onRoleDelete?: (roleId: string) => void;
  testId?: string;
  className?: string;
}

