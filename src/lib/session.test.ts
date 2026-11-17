import { describe, expect, it } from "vitest";
import { hashPassword, readSession, signSession, verifyPassword } from "./session";

describe("session", () => {
  it("hashes and verifies passwords", async () => {
    const h = await hashPassword("pw-123456");
    expect(await verifyPassword("pw-123456", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
  it("signs tokens that cannot be altered or used after expiry", async () => {
    const t = await signSession("user1", 60);
    expect(await readSession(t)).toBe("user1");
    expect(await readSession(t.replace("user1", "user2"))).toBeNull();
    expect(await readSession(await signSession("user1", -1))).toBeNull();
    expect(await readSession(undefined)).toBeNull();
  });
});
