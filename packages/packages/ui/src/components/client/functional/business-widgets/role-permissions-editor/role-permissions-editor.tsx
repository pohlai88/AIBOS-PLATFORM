/**
 * RolePermissionsEditor Component - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

"use client";

import { ShieldCheckIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { RolePermissionsEditorProps, Role, Permission } from "./role-permissions-editor.types";

const rolePermissionsVariants = {
  base: ["flex h-full", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "overflow-hidden", "mcp-functional-component"].join(" "),
  sidebar: ["w-64 border-r", colorTokens.border, colorTokens.bgMuted, "flex flex-col"].join(" "),
  sidebarHeader: ["p-4 border-b", colorTokens.border].join(" "),
  roleList: ["flex-1 overflow-auto p-2"].join(" "),
  roleItem: ["flex items-center gap-2 p-2 w-full text-left", radiusTokens.md, "hover:bg-muted", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
  main: ["flex-1 flex flex-col overflow-hidden"].join(" "),
  mainHeader: ["p-4 border-b", colorTokens.border].join(" "),
  permissionList: ["flex-1 overflow-auto p-4"].join(" "),
  category: ["mb-6"].join(" "),
  categoryTitle: ["text-sm font-semibold mb-2", colorTokens.fgMuted].join(" "),
  permission: ["flex items-center justify-between py-2 border-b last:border-b-0", colorTokens.border].join(" "),
};

export function RolePermissionsEditor({
  roles,
  permissions,
  selectedRoleId,
  onRoleSelect,
  onPermissionToggle,
  onRoleCreate,
  onRoleDelete,
  testId,
  className,
}: RolePermissionsEditorProps) {
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const categories = [...new Set(permissions.map((p) => p.category))];

  const getPermissionsByCategory = (category: string) =>
    permissions.filter((p) => p.category === category);

  return (
    <div
      className={cn(rolePermissionsVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className={rolePermissionsVariants.sidebar}>
        <div className={rolePermissionsVariants.sidebarHeader}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Roles</span>
            {onRoleCreate && (
              <button
                type="button"
                onClick={() => onRoleCreate("New Role")}
                className={cn("p-1", radiusTokens.md, "hover:bg-muted")}
                aria-label="Create new role"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className={rolePermissionsVariants.roleList} role="listbox" aria-label="Roles">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              role="option"
              aria-selected={role.id === selectedRoleId}
              onClick={() => onRoleSelect(role.id)}
              className={cn(
                rolePermissionsVariants.roleItem,
                role.id === selectedRoleId && "bg-primary/10"
              )}
            >
              <ShieldCheckIcon className="h-5 w-5" />
              <span className="flex-1 text-sm">{role.name}</span>
              {role.isSystem && (
                <span className={cn("text-xs px-1.5 py-0.5", colorTokens.bgMuted, radiusTokens.sm)}>System</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={rolePermissionsVariants.main}>
        {selectedRole ? (
          <>
            <div className={rolePermissionsVariants.mainHeader}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{selectedRole.name}</h2>
                  {selectedRole.description && (
                    <p className={cn("text-sm mt-1", colorTokens.fgMuted)}>{selectedRole.description}</p>
                  )}
                </div>
                {onRoleDelete && !selectedRole.isSystem && (
                  <button
                    type="button"
                    onClick={() => onRoleDelete(selectedRole.id)}
                    className={cn("p-2 text-destructive", radiusTokens.md, "hover:bg-destructive/10")}
                    aria-label="Delete role"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className={rolePermissionsVariants.permissionList}>
              {categories.map((category) => (
                <div key={category} className={rolePermissionsVariants.category}>
                  <h3 className={rolePermissionsVariants.categoryTitle}>{category}</h3>
                  {getPermissionsByCategory(category).map((perm) => (
                    <div key={perm.id} className={rolePermissionsVariants.permission}>
                      <div>
                        <span className="text-sm">{perm.name}</span>
                        {perm.description && (
                          <p className={cn("text-xs", colorTokens.fgMuted)}>{perm.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={selectedRole.permissions.includes(perm.id)}
                        onClick={() => onPermissionToggle(selectedRole.id, perm.id, !selectedRole.permissions.includes(perm.id))}
                        disabled={selectedRole.isSystem}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          selectedRole.permissions.includes(perm.id) ? "bg-primary" : colorTokens.bgMuted,
                          selectedRole.isSystem && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                            selectedRole.permissions.includes(perm.id) && "translate-x-5"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={cn("flex-1 flex items-center justify-center", colorTokens.fgMuted)}>
            Select a role to edit permissions
          </div>
        )}
      </div>
    </div>
  );
}

RolePermissionsEditor.displayName = "RolePermissionsEditor";
export { rolePermissionsVariants };
export type { RolePermissionsEditorProps, Role, Permission } from "./role-permissions-editor.types";
export default RolePermissionsEditor;

