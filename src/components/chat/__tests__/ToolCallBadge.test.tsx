import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src/App.tsx" })).toBe("Creating App.tsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "src/utils.ts" })).toBe("Editing utils.ts");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "src/index.ts" })).toBe("Editing index.ts");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "public/config.json" })).toBe("Reading config.json");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "src/Button.tsx" })).toBe("Undoing edit in Button.tsx");
});

test("getToolLabel: file_manager rename", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "src/OldName.tsx" })).toBe("Renaming OldName.tsx");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "src/temp.ts" })).toBe("Deleting temp.ts");
});

test("getToolLabel: unknown tool falls back to tool name", () => {
  expect(getToolLabel("some_other_tool", { command: "run", path: "file.ts" })).toBe("some_other_tool");
});

test("getToolLabel: path with no slashes returns the path as-is", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "App.tsx" })).toBe("Creating App.tsx");
});

test("getToolLabel: missing path returns empty string in label", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" })).toBe("Creating ");
});

// --- ToolCallBadge render tests ---

function makeToolInvocation(overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/App.tsx" },
    state: "call",
    ...overrides,
  } as ToolInvocation;
}

test("ToolCallBadge shows friendly label for create command", () => {
  render(<ToolCallBadge toolInvocation={makeToolInvocation()} />);
  expect(screen.getByText("Creating App.tsx")).toBeDefined();
});

test("ToolCallBadge shows friendly label for str_replace command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeToolInvocation({ args: { command: "str_replace", path: "src/utils.ts" } })}
    />
  );
  expect(screen.getByText("Editing utils.ts")).toBeDefined();
});

test("ToolCallBadge shows spinner when in progress", () => {
  const { container } = render(<ToolCallBadge toolInvocation={makeToolInvocation({ state: "call" })} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows green dot when done", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeToolInvocation({ state: "result", result: "Success" } as Partial<ToolInvocation>)}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge shows spinner when result is null", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeToolInvocation({ state: "result", result: null } as Partial<ToolInvocation>)}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallBadge falls back to tool name for unknown tool", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeToolInvocation({ toolName: "unknown_tool", args: {} })}
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});
