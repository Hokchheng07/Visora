import test from "node:test";
import assert from "node:assert/strict";
import editorReducer from "../../redux/editorSlice.js";
import { buildTemplateRecord, loadPublishedTemplates, publishTemplate } from "./templatePublish.js";

const editor = editorReducer(undefined, { type: "init" });

test("public submissions are pending review, while private saves remain private", () => {
  const publicRecord = buildTemplateRecord({ editor, title: "Backdrop", visibility: "public" });
  const privateRecord = buildTemplateRecord({ editor, title: "Backdrop", visibility: "private" });
  const legacyRecord = buildTemplateRecord({ editor, title: "Backdrop", visibility: "team" });

  assert.equal(publicRecord.status, "pending");
  assert.equal(publicRecord.visibility, "public");
  assert.equal(privateRecord.status, "private");
  assert.equal(privateRecord.visibility, "private");
  assert.equal(legacyRecord.status, "private");
  assert.equal(legacyRecord.visibility, "private");
});

test("publishing always succeeds, keeps the submission for this visit, and writes nothing to storage", async () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: () => { throw new Error("storage is full"); },
  };
  const record = buildTemplateRecord({ editor, title: "Backdrop", visibility: "public" });

  assert.equal(await publishTemplate(record), record);

  assert.equal(loadPublishedTemplates(storage)[0].status, "pending");
  assert.equal(values.size, 0);
});
