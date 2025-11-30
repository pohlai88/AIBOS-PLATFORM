import { engineRegistry } from "./engine.registry";
import { metadataRegistry } from "./metadata.registry";
import { actionRegistry } from "./action.registry";
import { uiRegistry } from "../ui/ui.registry";

export function initRegistries() {
  engineRegistry.init();
  metadataRegistry.init();
  actionRegistry.init();
  uiRegistry.init();
}

