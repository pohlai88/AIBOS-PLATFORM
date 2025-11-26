export interface KernelEvent {
  name: string;
  tenant: string;
  engine: string;
  payload: any;
  timestamp: number;
  user?: any;
}

export type EventHandler = (event: KernelEvent) => void | Promise<void>;

