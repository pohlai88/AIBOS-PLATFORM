import { kernelState } from "./state";

export function collectDiagnostics() {
  return {
    bootTimeMs: kernelState.bootCompleted - kernelState.bootStarted,
    runtimeMs: Date.now() - kernelState.bootCompleted,
    enginesLoaded: kernelState.enginesLoaded,
    metadataModels: kernelState.metadataCount,
    uiSchemas: kernelState.uiSchemaCount,
    aiReady: kernelState.aiReady,
    tenantsReady: kernelState.tenantsReady,
    dbReady: kernelState.dbReady,
    apiReady: kernelState.apiReady,
    timestamp: Date.now(),
  };
}

