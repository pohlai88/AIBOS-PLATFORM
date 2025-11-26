/**
 * FileBrowser Component - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

"use client";

import { FolderIcon, DocumentIcon, Squares2X2Icon, ListBulletIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { FileBrowserProps, FileItem, FileBrowserView } from "./file-browser.types";

const fileBrowserVariants = {
  base: ["flex flex-col", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "mcp-functional-component"].join(" "),
  toolbar: ["flex items-center justify-between p-3 border-b", colorTokens.border].join(" "),
  breadcrumb: ["flex items-center gap-1 text-sm"].join(" "),
  content: ["flex-1 p-4 overflow-auto"].join(" "),
  grid: ["grid grid-cols-4 gap-4"].join(" "),
  list: ["space-y-1"].join(" "),
  item: ["flex items-center gap-3 p-2 cursor-pointer", radiusTokens.md, "hover:bg-muted", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
  gridItem: ["flex flex-col items-center gap-2 p-4 cursor-pointer", radiusTokens.md, "hover:bg-muted", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileBrowser({
  files,
  currentPath,
  selectedIds = [],
  view = "list",
  onNavigate,
  onSelect,
  onOpen,
  onDelete,
  onRename,
  onCreateFolder,
  testId,
  className,
}: FileBrowserProps) {
  const [currentView, setCurrentView] = React.useState<FileBrowserView>(view);
  const pathParts = currentPath.split("/").filter(Boolean);

  const handleItemClick = (file: FileItem, e: React.MouseEvent) => {
    if (e.detail === 2) {
      if (file.type === "folder") {
        onNavigate(file.path);
      } else {
        onOpen?.(file);
      }
    } else if (onSelect) {
      const newSelection = e.ctrlKey || e.metaKey
        ? selectedIds.includes(file.id)
          ? selectedIds.filter((id) => id !== file.id)
          : [...selectedIds, file.id]
        : [file.id];
      onSelect(newSelection);
    }
  };

  return (
    <div
      className={cn(fileBrowserVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className={fileBrowserVariants.toolbar}>
        <nav className={fileBrowserVariants.breadcrumb} aria-label="Breadcrumb">
          <button type="button" onClick={() => onNavigate("/")} className="hover:underline">Home</button>
          {pathParts.map((part, i) => (
            <React.Fragment key={i}>
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              <button
                type="button"
                onClick={() => onNavigate("/" + pathParts.slice(0, i + 1).join("/"))}
                className="hover:underline"
              >
                {part}
              </button>
            </React.Fragment>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentView("grid")}
            aria-label="Grid view"
            className={cn("p-1.5", radiusTokens.md, currentView === "grid" ? "bg-muted" : "hover:bg-muted")}
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentView("list")}
            aria-label="List view"
            className={cn("p-1.5", radiusTokens.md, currentView === "list" ? "bg-muted" : "hover:bg-muted")}
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className={fileBrowserVariants.content} role="listbox" aria-multiselectable="true">
        <div className={currentView === "grid" ? fileBrowserVariants.grid : fileBrowserVariants.list}>
          {files.map((file) => (
            <button
              key={file.id}
              type="button"
              role="option"
              aria-selected={selectedIds.includes(file.id)}
              onClick={(e) => handleItemClick(file, e)}
              className={cn(
                currentView === "grid" ? fileBrowserVariants.gridItem : fileBrowserVariants.item,
                selectedIds.includes(file.id) && "bg-primary/10"
              )}
            >
              {file.type === "folder" ? (
                <FolderIcon className={cn("h-8 w-8", currentView === "list" && "h-5 w-5")} />
              ) : (
                <DocumentIcon className={cn("h-8 w-8", currentView === "list" && "h-5 w-5")} />
              )}
              <span className={cn("text-sm", currentView === "grid" && "text-center truncate w-full")}>{file.name}</span>
              {currentView === "list" && (
                <>
                  <span className={cn("ml-auto text-xs", colorTokens.fgMuted)}>{formatSize(file.size)}</span>
                  <span className={cn("text-xs w-32", colorTokens.fgMuted)}>
                    {file.modifiedAt?.toLocaleDateString()}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

FileBrowser.displayName = "FileBrowser";
export { fileBrowserVariants };
export type { FileBrowserProps, FileItem, FileBrowserView } from "./file-browser.types";
export default FileBrowser;

