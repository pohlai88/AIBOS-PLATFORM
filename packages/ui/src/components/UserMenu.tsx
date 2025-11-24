// packages/ui/src/components/UserMenu.tsx
// Base UserMenu component - token-compliant, accessible, MCP-ready

import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";
import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  typographyTokens,
  componentTokens,
} from "../design/tokens";
import { cn } from "../lib/cn";

export interface UserMenuItem {
  /** Item label */
  label: string;
  /** Item href or action */
  href?: string;
  /** Item icon (optional) */
  icon?: React.ReactNode;
  /** Click handler (if href is not provided) */
  onClick?: () => void;
  /** Whether item is a separator */
  separator?: boolean;
}

export interface UserMenuProps {
  /** User name */
  userName?: string;
  /** User email */
  userEmail?: string;
  /** User avatar image URL */
  userAvatar?: string;
  /** User avatar fallback (initials, etc.) */
  userAvatarFallback?: string;
  /** Menu items */
  items?: UserMenuItem[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * UserMenu component
 *
 * A token-compliant, accessible user menu that works with:
 * - Safe Mode (`[data-safe-mode="true"]`)
 * - Dark Mode (`.dark` class)
 * - WCAG contrast modes (`data-contrast="aa"` / `data-contrast="aaa"`)
 * - Tenant theming (via CSS variable overrides)
 *
 * Uses Headless UI for accessibility and behavior.
 * All styling uses semantic tokens from the design system.
 */
export function UserMenu({
  userName = "User",
  userEmail,
  userAvatar,
  userAvatarFallback,
  items = [],
  className,
}: UserMenuProps) {
  const menuItems: UserMenuItem[] = items || [];
  const avatarContent = userAvatar ? (
    <img
      src={userAvatar}
      alt={userName}
      className="size-8 rounded-full"
      aria-hidden="true"
    />
  ) : (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-full",
        "bg-primary-soft",
        "text-primary-foreground",
        typographyTokens.bodySm,
        "font-semibold"
      )}
      aria-hidden="true"
    >
      {userAvatarFallback ||
        (userName && userName.length > 0
          ? userName.charAt(0).toUpperCase()
          : "U")}
    </div>
  );

  return (
    <Menu as="div" className={cn("relative", className)}>
      <MenuButton
        className={cn(
          "flex items-center gap-2",
          radiusTokens.md,
          spacingTokens.sm,
          colorTokens.text.muted,
          "hover:text-fg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="User menu"
      >
        {avatarContent}
        <div className="hidden flex-col items-start text-left lg:flex">
          <span className={typographyTokens.bodySm}>{userName}</span>
          {userEmail && (
            <span
              className={cn(typographyTokens.bodySm, colorTokens.text.subtle)}
            >
              {userEmail}
            </span>
          )}
        </div>
        <svg
          className="hidden size-4 lg:block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </MenuButton>

      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className={cn(
            "absolute right-0 mt-2 w-56 origin-top-right",
            "flex flex-col",
            radiusTokens.lg,
            "border border-border-subtle",
            colorTokens.surface.elevated,
            shadowTokens.md,
            spacingTokens.sm,
            "focus:outline-none",
            "z-50"
          )}
        >
          {/* User Info (optional) */}
          {(userName || userEmail) && (
            <div
              className={cn(
                "flex flex-col",
                spacingTokens.sm,
                "border-b border-border-subtle",
                "pb-2"
              )}
            >
              {userName && (
                <span className={typographyTokens.bodySm}>{userName}</span>
              )}
              {userEmail && (
                <span
                  className={cn(
                    typographyTokens.bodySm,
                    colorTokens.text.subtle
                  )}
                >
                  {userEmail}
                </span>
              )}
            </div>
          )}

          {/* Menu Items */}
          {menuItems.map((item: UserMenuItem, index: number) => {
            if (item.separator) {
              return (
                <div
                  key={index}
                  className={cn("my-1 border-t border-border-subtle")}
                />
              );
            }

            const itemContent = (
              <>
                {item.icon && (
                  <span className="flex flex-none items-center">
                    {item.icon}
                  </span>
                )}
                <span className="grow">{item.label}</span>
              </>
            );

            const itemClasses = cn(
              "flex items-center gap-2",
              radiusTokens.md,
              spacingTokens.sm,
              typographyTokens.bodySm,
              colorTokens.text.muted,
              "hover:bg-bg-muted hover:text-fg",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            );

            if (item.href) {
              return (
                <MenuItem key={index}>
                  {({ focus }: { focus: boolean }) => (
                    <a
                      href={item.href}
                      className={cn(
                        itemClasses,
                        focus && "bg-bg-muted text-fg"
                      )}
                    >
                      {itemContent}
                    </a>
                  )}
                </MenuItem>
              );
            }

            return (
              <MenuItem key={index}>
                {({ focus }: { focus: boolean }) => (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={cn(itemClasses, focus && "bg-bg-muted text-fg")}
                  >
                    {itemContent}
                  </button>
                )}
              </MenuItem>
            );
          })}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
