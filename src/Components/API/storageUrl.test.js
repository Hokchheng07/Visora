import assert from "node:assert/strict";
import test from "node:test";
import { hasStorageBase, storageUrl } from "./storageUrl.js";

test("a base that was never set is not a base", () => {
  // Vite writes the literal string "undefined" into the bundle for a missing variable.
  assert.equal(hasStorageBase("undefined"), false);
  assert.equal(hasStorageBase("null"), false);
  assert.equal(hasStorageBase(""), false);
  assert.equal(hasStorageBase("   "), false);
  assert.equal(hasStorageBase(undefined), false);
  assert.equal(hasStorageBase("https://visora-api.gital.me/storage"), true);
});

test("an unset base gives no address at all, rather than a wrong one", () => {
  assert.equal(storageUrl(undefined, "a1b2c3.jpg"), "");
  assert.equal(storageUrl("undefined", "a1b2c3.jpg"), "");
});

test("the file is joined to the base with exactly one slash", () => {
  assert.equal(storageUrl("https://api.test/storage", "a1b2c3.jpg"), "https://api.test/storage/a1b2c3.jpg");
  assert.equal(storageUrl("https://api.test/storage/", "a1b2c3.jpg"), "https://api.test/storage/a1b2c3.jpg");
  assert.equal(storageUrl("https://api.test/storage", "/a1b2c3.jpg"), "https://api.test/storage/a1b2c3.jpg");
});

test("no file name, no address", () => {
  assert.equal(storageUrl("https://api.test/storage", ""), "");
  assert.equal(storageUrl("https://api.test/storage", undefined), "");
});
