import test from "node:test";
import assert from "node:assert/strict";
import { addUpload, MAX_UPLOADS, readUploads, removeUpload, withDocumentImages, writeUploads } from "./uploadHistory.js";

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
}

test("uploads are newest first, never duplicated and capped", () => {
  let list = [];
  list = addUpload(list, { fileName: "a.png" });
  list = addUpload(list, { fileName: "b.png" });
  list = addUpload(list, { fileName: "a.png", name: "again" });
  assert.deepEqual(list.map((item) => item.fileName), ["a.png", "b.png"]);
  assert.equal(list[0].name, "again");
  assert.equal(addUpload(list, { fileName: "" }), list);
  for (let index = 0; index < MAX_UPLOADS + 5; index += 1) list = addUpload(list, { fileName: `${index}.png` });
  assert.equal(list.length, MAX_UPLOADS);
  assert.deepEqual(removeUpload([{ fileName: "a.png" }, { fileName: "b.png" }], "a.png"), [{ fileName: "b.png" }]);
});

test("each account keeps its own list, and bad data reads as empty", () => {
  const storage = memoryStorage();
  writeUploads("hok", [{ fileName: "h.png" }], storage);
  writeUploads("dara", [{ fileName: "d.png" }], storage);
  assert.deepEqual(readUploads("hok", storage), [{ fileName: "h.png" }]);
  assert.deepEqual(readUploads("dara", storage), [{ fileName: "d.png" }]);
  assert.deepEqual(readUploads("", storage), []);
  storage.setItem("visora.uploads.v1.broken", "{not json");
  assert.deepEqual(readUploads("broken", storage), []);
  storage.setItem("visora.uploads.v1.mixed", JSON.stringify([{ fileName: "ok.png" }, null, { name: "no file" }]));
  assert.deepEqual(readUploads("mixed", storage), [{ fileName: "ok.png" }]);
});

test("pictures already on the design are listed after the remembered ones", () => {
  const pages = [
    { elements: [{ type: "image", src: "on-page.png", name: "Logo", w: 400, h: 200 }, { type: "text" }] },
    { elements: [{ type: "image", src: "remembered.png", w: 10, h: 10 }, { type: "image", src: "on-page.png", w: 1, h: 1 }] },
  ];
  const list = withDocumentImages([{ fileName: "remembered.png" }], pages);
  assert.deepEqual(list.map((item) => item.fileName), ["remembered.png", "on-page.png"]);
  assert.deepEqual(list[1], { fileName: "on-page.png", name: "Logo", width: 400, height: 200, inUse: true });
  assert.equal(withDocumentImages([{ fileName: "unused.png" }], pages)[0].inUse, undefined);
});
