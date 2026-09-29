import test from "node:test";
import assert from "node:assert/strict";
import { newestPerDesign, replacedBy } from "./templateVersions.js";

test("the gallery keeps only a design's newest approved template", () => {
  const old = { uuid: "a", sourceBackdropUuid: "d1", createdAt: "2026-09-29T06:18:00Z" };
  const updated = { uuid: "b", sourceBackdropUuid: "d1", createdAt: "2026-09-29T06:23:00Z" };
  const other = { uuid: "c", sourceBackdropUuid: "d2", createdAt: "2026-09-28T00:00:00Z" };
  const loose = { uuid: "e" };
  assert.deepEqual(newestPerDesign([old, updated, other, loose]), [updated, other, loose]);
});

test("approving a new version replaces only that design's published ones", () => {
  const rows = [
    { remoteId: "a", sourceBackdropUuid: "d1", status: "published" },
    { remoteId: "b", sourceBackdropUuid: "d1", status: "pending" },
    { remoteId: "c", sourceBackdropUuid: "d1", status: "rejected" },
    { remoteId: "d", sourceBackdropUuid: "d2", status: "published" },
  ];
  assert.deepEqual(replacedBy(rows, rows[1]).map((row) => row.remoteId), ["a"]);
  assert.deepEqual(replacedBy(rows, { remoteId: "x" }), []);
});
