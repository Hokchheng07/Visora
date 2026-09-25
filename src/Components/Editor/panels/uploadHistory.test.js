import test from "node:test";
import assert from "node:assert/strict";
import { uploadsFromServer, withDocumentImages } from "./uploadHistory.js";

test("server files become picture tiles, newest first", () => {
  const list = uploadsFromServer([
    { fileName: "old.png", originalFileName: "Old.png", mimeType: "image/png", createdAt: "2026-09-01T10:00:00" },
    { fileName: "notes.pdf", originalFileName: "Notes.pdf", mimeType: "application/pdf", createdAt: "2026-09-03T10:00:00" },
    { fileName: "new.jpg", originalFileName: "New.jpg", mimeType: "image/jpeg", createdAt: "2026-09-02T10:00:00" },
    { originalFileName: "no file name", mimeType: "image/png" },
    null,
  ]);
  assert.deepEqual(list, [
    { fileName: "new.jpg", name: "New.jpg", uploadedAt: "2026-09-02T10:00:00" },
    { fileName: "old.png", name: "Old.png", uploadedAt: "2026-09-01T10:00:00" },
  ]);
});

test("a missing or broken server answer reads as no uploads", () => {
  assert.deepEqual(uploadsFromServer(undefined), []);
  assert.deepEqual(uploadsFromServer({ contents: [] }), []);
});

test("pictures already on the design are listed after the server's ones", () => {
  const pages = [
    { elements: [{ type: "image", src: "on-page.png", name: "Logo", w: 400, h: 200 }, { type: "text" }] },
    { elements: [{ type: "image", src: "uploaded.png", w: 10, h: 10 }, { type: "image", src: "on-page.png", w: 1, h: 1 }] },
  ];
  const list = withDocumentImages([{ fileName: "uploaded.png" }], pages);
  assert.deepEqual(list.map((item) => item.fileName), ["uploaded.png", "on-page.png"]);
  assert.deepEqual(list[1], { fileName: "on-page.png", name: "Logo", width: 400, height: 200, inUse: true });
  assert.equal(withDocumentImages([{ fileName: "unused.png" }], pages)[0].inUse, undefined);
});

test("design pictures that are not storage files are not listed as uploads", () => {
  const pages = [{ elements: [
    { type: "image", src: "data:image/png;base64,iVBORw0KGgo" },
    { type: "image", src: "https://example.com/cat.png" },
    { type: "image", src: "library:khmer-flower" },
    { type: "image", src: "kept.png" },
  ] }];
  assert.deepEqual(withDocumentImages([], pages).map((item) => item.fileName), ["kept.png"]);
});
