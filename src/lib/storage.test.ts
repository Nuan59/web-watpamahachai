import { describe, expect, it } from "vitest";
import { keyToPath, readUpload, saveUpload, UploadError } from "./storage";

describe("storage", () => {
  it("refuses keys that escape the upload folder", () => {
    expect(() => keyToPath("../etc/passwd")).toThrow();
    expect(() => keyToPath("/etc/passwd")).toThrow();
  });
  it("saves images and audio by type, refuses other files", async () => {
    const img = await saveUpload(new File([new Uint8Array([1, 2, 3])], "a.png", { type: "image/png" }), "public/test");
    expect(img).toMatch(/^public\/test\/.+\.png$/);
    expect((await readUpload(img))?.length).toBe(3);
    const mp3 = await saveUpload(new File([new Uint8Array([1])], "talk.mp3", { type: "" }), "public/audio", "audio");
    expect(mp3).toMatch(/\.mp3$/);
    await expect(saveUpload(new File(["x"], "a.html", { type: "text/html" }), "public/test")).rejects.toBeInstanceOf(UploadError);
    await expect(saveUpload(new File(["x"], "a.png", { type: "image/png" }), "public/test", "audio")).rejects.toBeInstanceOf(UploadError);
  });
});
