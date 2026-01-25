import { describe, it, expect } from "vitest";
import {
  resolvePath,
  extractDirectory,
  getParentDir,
} from "../../src/scripts/terminal/commands/utils";

describe("resolvePath", () => {
  it("returns empty string for current directory at root", () => {
    expect(resolvePath(".", "~")).toBe("");
  });

  it("returns current directory for . when in subdirectory", () => {
    expect(resolvePath(".", "~/blog/posts")).toBe("posts");
  });

  it("handles parent directory navigation", () => {
    expect(resolvePath("..", "~/blog/posts")).toBe("");
  });

  it("handles home directory shortcut", () => {
    expect(resolvePath("~", "~/blog/posts")).toBe("");
  });

  it("handles relative paths with ./", () => {
    expect(resolvePath("./posts", "~")).toBe("posts");
  });

  it("handles absolute-ish paths", () => {
    expect(resolvePath("posts", "~")).toBe("posts");
    expect(resolvePath("series/learning-go", "~")).toBe("series/learning-go");
  });
});

describe("extractDirectory", () => {
  it("extracts directory from path with ~", () => {
    expect(extractDirectory("~/posts")).toBe("posts");
  });

  it("extracts directory from path with ~/blog", () => {
    expect(extractDirectory("~/blog/posts")).toBe("posts");
  });

  it("returns empty string for home", () => {
    expect(extractDirectory("~")).toBe("");
  });
});

describe("getParentDir", () => {
  it("returns parent of nested directory", () => {
    expect(getParentDir("series/aoc")).toBe("series");
  });

  it("returns empty string for root-level directory", () => {
    expect(getParentDir("posts")).toBe("");
  });

  it("returns empty string for empty path", () => {
    expect(getParentDir("")).toBe("");
  });
});
