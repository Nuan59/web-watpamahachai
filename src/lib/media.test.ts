import { describe, expect, it } from "vitest";
import { attachment, downloadName, streamKind, videoIds, youtubeId } from "./media";

describe("youtube", () => {
  it("reads common link shapes", () => {
    for (const u of ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ", "https://m.youtube.com/watch?feature=x&v=dQw4w9WgXcQ", "https://www.youtube.com/shorts/dQw4w9WgXcQ", "https://www.youtube.com/live/dQw4w9WgXcQ"])
      expect(youtubeId(u)).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://evil.test/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(youtubeId("https://www.youtube.com/channel/UCoR3jcrO2MW6HXnOmCN3-dQ")).toBeNull();
  });
  it("turns a pasted list into unique ids", () => {
    expect(videoIds("https://youtu.be/dQw4w9WgXcQ\n\nnot a link\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\r\nhttps://youtu.be/aaaaaaaaaaa")).toEqual(["dQw4w9WgXcQ", "aaaaaaaaaaa"]);
  });
});

describe("downloads", () => {
  it("makes a safe Thai file name", () => {
    expect(downloadName("ธรรมกำไรชีวิต ๐๐๑ / กายทุจริต?", "mp3")).toBe("ธรรมกำไรชีวิต ๐๐๑ กายทุจริต.mp3");
    expect(downloadName("../../etc", "pdf")).toBe(".. .. etc.pdf");
    expect(downloadName("!!!", "zip")).toBe("file.zip");
  });
  it("encodes Thai names in the header", () => {
    const h = attachment("คติธรรม ๑.mp3");
    expect(h).toContain('filename="');
    expect(h).toContain("filename*=UTF-8''" + encodeURIComponent("คติธรรม ๑.mp3"));
    expect(h).not.toMatch(/[^\x20-\x7e]/);
  });
});

it("tells HLS streams from direct ones", () => {
  expect(streamKind("https://radio.test/live.m3u8")).toBe("hls");
  expect(streamKind("https://radio.test:8000/stream")).toBe("direct");
  expect(streamKind("javascript:x")).toBeNull();
  expect(streamKind("")).toBeNull();
});
