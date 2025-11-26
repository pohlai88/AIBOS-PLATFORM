import { exportNodesToMCP } from "./bridge";

figma.ui.onmessage = async (msg) => {
  if (msg.type === "VALIDATE_SELECTION") {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.ui.postMessage({ type: "NO_SELECTION" });
      return;
    }

    const exportedNodes = exportNodesToMCP(selection);

    figma.ui.postMessage({
      type: "NODES_EXPORTED",
      data: exportedNodes,
    });
  }

  if (msg.type === "VALIDATE_PAGE") {
    const pageNodes = figma.currentPage.children;

    if (pageNodes.length === 0) {
      figma.ui.postMessage({ type: "NO_NODES" });
      return;
    }

    const exportedNodes = exportNodesToMCP(pageNodes);

    figma.ui.postMessage({
      type: "NODES_EXPORTED",
      data: exportedNodes,
    });
  }
};

figma.showUI(__html__, { width: 400, height: 600 });

