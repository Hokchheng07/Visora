import assert from "node:assert/strict";
import test from "node:test";
import { uploadErrorMessage } from "./apiError.js";

test("a refused account is named as such, not as a retry", () => {
  const message = uploadErrorMessage({ status: 403 });
  assert.match(message, /isn't allowed to upload/);
  assert.doesNotMatch(message, /try again/i);
});

test("the server's own words win when it sent any", () => {
  assert.equal(uploadErrorMessage({ status: 403, data: { detail: "Quota exceeded" } }), "Quota exceeded");
  assert.equal(uploadErrorMessage({ status: 500, data: { message: "Disk full" } }), "Disk full");
  assert.equal(uploadErrorMessage({ status: 400, data: "Bad file" }), "Bad file");
});

test("an unreachable backend points at the setting that decides where it is", () => {
  assert.match(uploadErrorMessage({ status: "FETCH_ERROR" }), /VITE_BASE_VISORA_URL/);
  assert.match(uploadErrorMessage({ status: 404 }), /VITE_BASE_VISORA_URL/);
});

test("a status with no explanation is still reported by number", () => {
  assert.match(uploadErrorMessage({ status: 500 }, "photo"), /photo \(server said 500\)/);
});

test("no error at all still gives a sentence", () => {
  assert.match(uploadErrorMessage(null, "photo"), /Couldn't upload that photo/);
});
