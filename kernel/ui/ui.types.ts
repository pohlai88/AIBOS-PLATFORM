export interface UIFieldSchema {
  component: string;
  label?: string;
  options?: string[];
  ref?: string;
}

export interface UIFormSchema {
  layout: "single-column" | "two-column";
  fields: Record<string, UIFieldSchema>;
}

export interface UITableSchema {
  columns: string[];
}

export interface UISchema {
  model: string;
  form: UIFormSchema;
  table: UITableSchema;
}

