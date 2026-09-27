import test from "node:test";
import assert from "node:assert/strict";
import { hydrateDocument, serializeDocument } from "./editorDocument.js";
import { dataUrlToFile, fromBackdropResponse, inlineImageSources, replaceImageSources, toBackdropRequest } from "./backdropPayload.js";
import editorReducer, { imageInserted, pageNumbersChanged, pageSizeChanged, textInserted } from "../../redux/editorSlice.js";

function sampleEditor() {
  let state = editorReducer(undefined, { type: "init" });
  state = editorReducer(state, textInserted("time"));
  state = editorReducer(state, imageInserted("photo.png", { width: 400, height: 300 }, "Photo"));
  state = editorReducer(state, imageInserted("data:image/png;base64,iVBORw0KGgo=", { width: 10, height: 10 }, "Sticker"));
  state = editorReducer(state, pageNumbersChanged({ enabled: true }));
  return editorReducer(state, pageSizeChanged({ width: 1080, height: 1920 }));
}

test("the request fits the server's schema: image is a string and lockAspect is not a boolean", () => {
  const request = toBackdropRequest(serializeDocument(sampleEditor()), { thumbnail: "thumb.png" });
  const components = request.pages.flatMap((page) => page.components);
  assert.equal(request.thumbnail, "thumb.png");
  assert.equal(request.orientation, "PORTRAIT");
  assert.equal("uuid" in request, false);
  assert.ok(components.every((component) => typeof (component.image ?? "") === "string"));
  assert.ok(components.every((component) => !("lockAspect" in component) && !("pageNumber" in component) && !("dynamic" in component)));
});

test("a design comes back from the server exactly as it went", () => {
  const document = serializeDocument(sampleEditor());
  // What the server stores and sends back, as JSON.
  const response = JSON.parse(JSON.stringify(toBackdropRequest(document)));
  const restored = hydrateDocument(fromBackdropResponse({ ...response, uuid: document.uuid }));
  const original = hydrateDocument(document);
  assert.deepEqual(restored.pages, original.pages);
  assert.deepEqual(restored.canvas, original.canvas);
  assert.deepEqual(restored.pageNumbers, original.pageNumbers);
});

test("inline pictures are found and swapped for uploaded file names", () => {
  const document = serializeDocument(sampleEditor());
  const [inline] = inlineImageSources(document);
  assert.match(inline, /^data:image\/png/);
  const swapped = replaceImageSources(document, new Map([[inline, "uploaded.png"]]));
  assert.deepEqual(inlineImageSources(swapped), []);
  assert.ok(swapped.pages[0].components.some((component) => component.image?.fileName === "uploaded.png"));
  const file = dataUrlToFile(inline, "sticker");
  assert.equal(file.type, "image/png");
  assert.equal(file.name, "sticker.png");
});

test("the server's ids and nulls never go back up, and every primitive field is sent", () => {
  const fromServer = { uuid: "b1", name: "Copy", canvas: { width: 1920, height: 1080 }, orientation: "LANDSCAPE", settings: null,
    pages: [{ id: null, uuid: "p1", pageNumber: 1, transition: null, components: [
      { id: null, uuid: "c1", type: "TEXT", content: "Hi", image: null, vector: null, position: { x: 1, y: 2 }, styles: { color: "#000" } },
    ] }] };
  const request = toBackdropRequest(fromBackdropResponse(fromServer));
  const [page] = request.pages, [component] = page.components;
  // Java records read a missing primitive as null, so ids go up as 0 ("not saved yet").
  assert.equal(page.id, 0);
  assert.equal("transition" in page, false);
  assert.equal(component.id, 0);
  // Every number and true/false field of ComponentRequest is present.
  assert.deepEqual([component.rotation, component.layerIndex, component.locked, component.visible, component.flipX, component.flipY], [0, 0, false, true, false, false]);
  assert.deepEqual(component.size, { width: 0, height: 0 });
  assert.equal("image" in component, false);
  assert.equal("vector" in component, false);
  assert.equal(component.content, "Hi");
  assert.equal(JSON.stringify(request).includes("null"), false);
});
