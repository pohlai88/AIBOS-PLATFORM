const components = new Map<string, any>();

export const uiRegistry = {
  init() {
    components.clear();
  },
  register(name: string, component: any) {
    components.set(name, component);
  },
  get(name: string) {
    return components.get(name);
  },
  list() {
    return Array.from(components.entries());
  },
};
