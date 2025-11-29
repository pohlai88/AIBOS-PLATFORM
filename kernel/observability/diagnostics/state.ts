/**
 * Kernel Diagnostics State
 * This stores live kernel status across modules.
 */

export const kernelState = {
  bootStarted: Date.now(),
  bootCompleted: 0,
  enginesLoaded: 0,
  metadataCount: 0,
  uiSchemaCount: 0,
  aiReady: false,
  tenantsReady: false,
  dbReady: false,
  apiReady: false,

  setBootCompleted() {
    this.bootCompleted = Date.now();
  }
};

