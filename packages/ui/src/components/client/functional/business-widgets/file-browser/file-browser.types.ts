/**
 * FileBrowser Types - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  modifiedAt?: Date;
  mimeType?: string;
  path: string;
}

export type FileBrowserView = "grid" | "list";

export interface FileBrowserProps {
  files: FileItem[];
  currentPath: string;
  selectedIds?: string[];
  view?: FileBrowserView;
  onNavigate: (path: string) => void;
  onSelect?: (ids: string[]) => void;
  onOpen?: (file: FileItem) => void;
  onDelete?: (ids: string[]) => void;
  onRename?: (id: string, newName: string) => void;
  onCreateFolder?: (name: string) => void;
  testId?: string;
  className?: string;
}

