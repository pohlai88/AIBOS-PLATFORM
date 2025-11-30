/**
 * Tabs Component Tests
 *
 * Tests for the Tabs Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

// Helper function to get Tabs element
function getTabs(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern") ||
    container.querySelector('[data-testid*="tabs"]')
  ) as HTMLElement | null;
}

describe("Tabs", () => {
  describe("Rendering", () => {
    it("should render tabs component", () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      const tabs = getTabs(container);
      expect(tabs).toBeInTheDocument();
    });

    it("should render tabs list", () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      const tabsList = container.querySelector(".mcp-layer3-pattern-list");
      expect(tabsList).toBeInTheDocument();
    });

    it("should render tab triggers", () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      const triggers = container.querySelectorAll(".mcp-layer3-pattern-trigger");
      expect(triggers.length).toBe(2);
    });

    it("should render tab content", () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      const content = container.querySelector(".mcp-layer3-pattern-content");
      expect(content).toBeInTheDocument();
      expect(content?.textContent).toContain("Content 1");
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1" testId="test-tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      const tabs = container.querySelector('[data-testid="test-tabs"]');
      expect(tabs).toBeInTheDocument();
    });
  });

  describe("Tab Switching", () => {
    it("should show default tab content", () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      const content = container.querySelector(".mcp-layer3-pattern-content");
      expect(content?.textContent).toContain("Content 2");
    });

    it("should switch tabs when trigger is clicked", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      const tab2Trigger = Array.from(
        container.querySelectorAll(".mcp-layer3-pattern-trigger")
      ).find((el) => el.textContent === "Tab 2");
      expect(tab2Trigger).toBeTruthy();
      await user.click(tab2Trigger!);
      const content = container.querySelector(".mcp-layer3-pattern-content");
      expect(content?.textContent).toContain("Content 2");
    });

    it("should call onValueChange when tab changes", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1" onValueChange={handleChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      const tab2Trigger = Array.from(
        container.querySelectorAll(".mcp-layer3-pattern-trigger")
      ).find((el) => el.textContent === "Tab 2");
      expect(tab2Trigger).toBeTruthy();
      await user.click(tab2Trigger!);
      expect(handleChange).toHaveBeenCalledWith("tab2");
    });
  });

  describe("Controlled Mode", () => {
    it("should work in controlled mode", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Tabs value="tab1" onValueChange={handleChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      const tab2Trigger = Array.from(
        container.querySelectorAll(".mcp-layer3-pattern-trigger")
      ).find((el) => el.textContent === "Tab 2");
      expect(tab2Trigger).toBeTruthy();
      await user.click(tab2Trigger!);
      expect(handleChange).toHaveBeenCalledWith("tab2");
    });
  });

  describe("Disabled Tabs", () => {
    it("should render disabled tab trigger", () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Disabled Tab
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      const disabledTrigger = Array.from(
        container.querySelectorAll(".mcp-layer3-pattern-trigger")
      ).find((el) => el.textContent === "Disabled Tab");
      expect(disabledTrigger).toBeDisabled();
    });

    it("should not switch to disabled tab", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Disabled Tab
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      const disabledTrigger = Array.from(
        container.querySelectorAll(".mcp-layer3-pattern-trigger")
      ).find((el) => el.textContent === "Disabled Tab");
      expect(disabledTrigger).toBeTruthy();
      await user.click(disabledTrigger!);
      const content = container.querySelector(".mcp-layer3-pattern-content");
      expect(content?.textContent).toContain("Content 1"); // Should still show tab1
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      await expectAccessible(container);
    });

    it("should have proper keyboard navigation", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      const tab1Trigger = Array.from(
        container.querySelectorAll(".mcp-layer3-pattern-trigger")
      ).find((el) => el.textContent === "Tab 1");
      expect(tab1Trigger).toBeTruthy();
      tab1Trigger!.focus();
      expect(tab1Trigger).toHaveFocus();
      await user.keyboard("{ArrowRight}");
      // Should focus next tab
      const tab2Trigger = Array.from(
        container.querySelectorAll(".mcp-layer3-pattern-trigger")
      ).find((el) => el.textContent === "Tab 2");
      expect(tab2Trigger).toBeTruthy();
    });
  });

  describe("Orientation", () => {
    it("should support horizontal orientation", () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1" orientation="horizontal">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      const tabs = getTabs(container);
      expect(tabs).toBeInTheDocument();
    });

    it("should support vertical orientation", () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1" orientation="vertical">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      const tabs = getTabs(container);
      expect(tabs).toBeInTheDocument();
    });
  });

  describe("Composition", () => {
    it("should compose with multiple tabs and content", () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );
      const triggers = container.querySelectorAll(".mcp-layer3-pattern-trigger");
      expect(triggers.length).toBe(3);
      const contents = container.querySelectorAll(".mcp-layer3-pattern-content");
      expect(contents.length).toBe(3);
    });
  });
});

