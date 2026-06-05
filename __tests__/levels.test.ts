import { describe, it, expect } from "vitest";
import { xpToLevel } from "../lib/levels";

describe("xpToLevel", () => {
  it("returns Builder at 0 XP", () => {
    const result = xpToLevel(0);
    expect(result.level).toBe(1);
    expect(result.name).toBe("Builder");
    expect(result.nextThreshold).toBe(50);
  });

  it("returns Creator at 50 XP", () => {
    const result = xpToLevel(50);
    expect(result.level).toBe(2);
    expect(result.name).toBe("Creator");
  });

  it("returns correct result at 75 XP (roadmap spec)", () => {
    const result = xpToLevel(75);
    expect(result.level).toBe(2);
    expect(result.name).toBe("Creator");
    expect(result.nextThreshold).toBe(100);
    expect(result.xpToNext).toBe(25);
  });

  it("returns AI Master Builder at 400 XP", () => {
    const result = xpToLevel(400);
    expect(result.level).toBe(7);
    expect(result.name).toBe("AI Master Builder");
    expect(result.nextThreshold).toBeNull();
    expect(result.xpToNext).toBeNull();
  });

  it("returns AI Master Builder when XP exceeds max threshold", () => {
    const result = xpToLevel(999);
    expect(result.name).toBe("AI Master Builder");
    expect(result.nextThreshold).toBeNull();
  });

  it("progress is 100% at max level", () => {
    const result = xpToLevel(500);
    expect(result.nextThreshold).toBeNull();
  });
});
