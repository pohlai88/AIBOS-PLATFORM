const uiSchemas = new Map<string, any>();
let isFrozen = false;

export const uiRegistry = {
  init() {
    uiSchemas.clear();
    isFrozen = false;
  },

  register(model: string, schema: any) {
    if (isFrozen) {
      throw new Error(`UIRegistry is frozen — cannot register schema for model: ${model}`);
    }
    uiSchemas.set(model, schema);
  },

  get(model: string) {
    return uiSchemas.get(model);
  },

  list() {
    return Array.from(uiSchemas.keys());
  },

  freeze() {
    isFrozen = true;
    return this;
  },

  get isFrozen() {
    return isFrozen;
  }
};

