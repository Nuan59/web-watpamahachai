import { describe, expect, it } from "vitest";
import { can, effectivePerms, firstAllowed, grantable, MODULES } from "./permissions";

const u = (role: string, perms = "{}") => ({ role, perms });

describe("permissions", () => {
  it("owner can do everything", () => {
    for (const m of MODULES) expect(can(u("OWNER"), m, "delete")).toBe(true);
  });
  it("admin runs content but not settings or users", () => {
    expect(can(u("ADMIN"), "events", "delete")).toBe(true);
    expect(can(u("ADMIN"), "messages", "view")).toBe(true);
    expect(can(u("ADMIN"), "settings", "view")).toBe(false);
    expect(can(u("ADMIN"), "users", "view")).toBe(false);
  });
  it("editor deletes nothing and does not see sign-ups", () => {
    expect(can(u("EDITOR"), "news", "edit")).toBe(true);
    expect(can(u("EDITOR"), "news", "delete")).toBe(false);
    expect(can(u("EDITOR"), "registrations", "view")).toBe(false);
  });
  it("per-account overrides replace the role default for that section only", () => {
    const x = u("EDITOR", JSON.stringify({ registrations: "v", news: "v" }));
    expect(can(x, "registrations", "view")).toBe(true);
    expect(can(x, "news", "edit")).toBe(false);
    expect(can(x, "gallery", "edit")).toBe(true);
  });
  it("ignores broken JSON and junk letters", () => {
    expect(effectivePerms(u("EDITOR", "not json")).news).toBe("vce");
    expect(effectivePerms(u("EDITOR", JSON.stringify({ news: "zzv" }))).news).toBe("v");
  });
  it("unknown role gets nothing", () => {
    expect(firstAllowed(u("GHOST"))).toBeNull();
    expect(firstAllowed(u("EDITOR"))).toBe("dashboard");
  });
  it("a non-owner cannot grant rights they do not hold", () => {
    const g = grantable(u("ADMIN"), { settings: "vced", news: "vced" });
    expect(g.settings).toBe("");
    expect(g.news).toBe("vced");
  });
});
