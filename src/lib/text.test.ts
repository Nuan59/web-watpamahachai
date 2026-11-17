import { describe, expect, it } from "vitest";
import { audioSrc, driveId, plainExcerpt, renderMarkdown, slugify } from "./text";

describe("slugify", () => {
  it("keeps Thai and digits, joins words with dashes", () => {
    expect(slugify("ทอดกฐิน 2569!")).toBe("ทอดกฐิน-2569");
    expect(slugify("  Hello  World ")).toBe("hello-world");
    expect(slugify("!!!")).toBe("page");
  });
});

describe("driveId / audioSrc", () => {
  const id = "1AbCdEfGhIjKlMnOpQrStUvWx";
  it("reads share links, ?id= links and bare ids", () => {
    expect(driveId(`https://drive.google.com/file/d/${id}/view?usp=sharing`)).toBe(id);
    expect(driveId(`https://drive.google.com/open?id=${id}`)).toBe(id);
    expect(driveId(id)).toBe(id);
    expect(driveId("nope")).toBeNull();
  });
  it("prefers an uploaded file, then Drive, then a direct URL", () => {
    expect(audioSrc({ fileKey: "public/audio/a.mp3", url: id })).toBe("/files/public/audio/a.mp3");
    expect(audioSrc({ fileKey: null, url: id })).toContain(id);
    expect(audioSrc({ fileKey: null, url: "https://x.test/a.mp3" })).toBe("https://x.test/a.mp3");
    expect(audioSrc({ fileKey: null, url: "javascript:alert(1)" })).toBeNull();
  });
});

describe("renderMarkdown", () => {
  it("renders markdown", () => {
    expect(renderMarkdown("## หัวข้อ\n\n- ข้อ 1")).toContain("<h2");
  });
  it("escapes raw HTML instead of rendering it", () => {
    const html = renderMarkdown('<script>alert(1)</script><img src=x onerror="a()">');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
  });
  it("embeds a YouTube link that stands alone in its paragraph", () => {
    expect(renderMarkdown("ดูคลิป\n\nhttps://youtu.be/dQw4w9WgXcQ")).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
    expect(renderMarkdown("ดูคลิปที่ https://youtu.be/dQw4w9WgXcQ นะ")).not.toContain("<iframe");
  });
  it("neutralises javascript: links and images", () => {
    expect(renderMarkdown("[x](javascript:alert(1))")).toContain('href="#"');
    expect(renderMarkdown("![x](javascript:alert(1))")).toContain('src="#"');
    expect(renderMarkdown("[fb](https://facebook.com)")).toContain('rel="noopener"');
  });
});

describe("plainExcerpt", () => {
  it("strips markdown and trims", () => {
    expect(plainExcerpt("## หัว\n\n**ตัวหนา** [ลิงก์](https://a.b)")).toBe("หัว ตัวหนา ลิงก์");
    expect(plainExcerpt("ก".repeat(200), 10)).toHaveLength(10);
  });
});
