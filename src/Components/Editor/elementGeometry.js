export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;
export const MIN_SIZE = 24;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const radians = (degrees) => degrees * Math.PI / 180;

export function bounds(element) {
  const angle = radians(element.rotation);
  const halfW = (Math.abs(Math.cos(angle)) * element.w + Math.abs(Math.sin(angle)) * element.h) / 2;
  const halfH = (Math.abs(Math.sin(angle)) * element.w + Math.abs(Math.cos(angle)) * element.h) / 2;
  const cx = element.x + element.w / 2;
  const cy = element.y + element.h / 2;
  return { left: cx - halfW, right: cx + halfW, top: cy - halfH, bottom: cy + halfH, halfW, halfH };
}

export function selectionBounds(elements) {
  if (!elements.length) return null;
  const boxes = elements.map(bounds);
  const left = Math.min(...boxes.map((box) => box.left));
  const right = Math.max(...boxes.map((box) => box.right));
  const top = Math.min(...boxes.map((box) => box.top));
  const bottom = Math.max(...boxes.map((box) => box.bottom));
  return { left, right, top, bottom, x: left, y: top, w: right - left, h: bottom - top };
}

export function clampSelectionDelta(elements, dx, dy) {
  const box = selectionBounds(elements);
  if (!box) return { x: 0, y: 0 };
  return {
    x: clamp(dx, -box.left, CANVAS_WIDTH - box.right),
    y: clamp(dy, -box.top, CANVAS_HEIGHT - box.bottom),
  };
}

export function intersectsRect(element, rect) {
  const box = bounds(element);
  return box.right >= rect.left && box.left <= rect.right && box.bottom >= rect.top && box.top <= rect.bottom;
}

export function elementsInRect(elements, rect) {
  const normalized = {
    left: Math.min(rect.left, rect.right), right: Math.max(rect.left, rect.right),
    top: Math.min(rect.top, rect.bottom), bottom: Math.max(rect.top, rect.bottom),
  };
  return elements.filter((element) => intersectsRect(element, normalized)).map((element) => element.id);
}

export function snapSelectionDelta(selectedElements, otherElements, dx, dy, threshold = 8) {
  const start = selectionBounds(selectedElements);
  if (!start) return { x: dx, y: dy, guides: [] };
  const moved = { left: start.left + dx, right: start.right + dx, top: start.top + dy, bottom: start.bottom + dy };
  moved.cx = (moved.left + moved.right) / 2;
  moved.cy = (moved.top + moved.bottom) / 2;
  const xTargets = [0, CANVAS_WIDTH / 2, CANVAS_WIDTH];
  const yTargets = [0, CANVAS_HEIGHT / 2, CANVAS_HEIGHT];
  for (const element of otherElements) {
    const box = bounds(element);
    xTargets.push(box.left, (box.left + box.right) / 2, box.right);
    yTargets.push(box.top, (box.top + box.bottom) / 2, box.bottom);
  }
  const xPoints = [moved.left, moved.cx, moved.right];
  const yPoints = [moved.top, moved.cy, moved.bottom];
  let bestX = null, bestY = null;
  for (const point of xPoints) for (const target of xTargets) {
    const distance = target - point;
    if (Math.abs(distance) <= threshold && (!bestX || Math.abs(distance) < Math.abs(bestX.distance))) bestX = { distance, target };
  }
  for (const point of yPoints) for (const target of yTargets) {
    const distance = target - point;
    if (Math.abs(distance) <= threshold && (!bestY || Math.abs(distance) < Math.abs(bestY.distance))) bestY = { distance, target };
  }
  return {
    x: dx + (bestX?.distance || 0), y: dy + (bestY?.distance || 0),
    guides: [bestX && { axis: "x", value: bestX.target }, bestY && { axis: "y", value: bestY.target }].filter(Boolean),
  };
}

export function scaleSelection(elements, startBox, handle, dx, dy, lockAspect = false) {
  if (!startBox || !elements.length) return elements;
  const sx = handle.includes("e") ? 1 : handle.includes("w") ? -1 : 0;
  const sy = handle.includes("s") ? 1 : handle.includes("n") ? -1 : 0;
  /* The anchored edge never moves, so it sets how far the opposite edge can
     travel before the group leaves the sheet. Capping here rather than
     nudging afterwards: a shift can only rescue one side, so a group grown
     wider than the sheet used to be pushed off the far edge instead. */
  const maxW = sx > 0 ? CANVAS_WIDTH - startBox.left : sx < 0 ? startBox.right : startBox.w;
  const maxH = sy > 0 ? CANVAS_HEIGHT - startBox.top : sy < 0 ? startBox.bottom : startBox.h;
  let nextW = clamp(startBox.w + sx * dx, MIN_SIZE, Math.max(MIN_SIZE, maxW));
  let nextH = clamp(startBox.h + sy * dy, MIN_SIZE, Math.max(MIN_SIZE, maxH));
  if (lockAspect && sx && sy) {
    const ratio = startBox.w / startBox.h;
    if (Math.abs(dx) > Math.abs(dy)) nextH = nextW / ratio;
    else nextW = nextH * ratio;
    // Re-fit the locked pair as a pair, so holding Shift can't defeat the caps.
    const shrink = Math.min(1, maxW / nextW, maxH / nextH);
    nextW *= shrink; nextH *= shrink;
    const grow = Math.max(1, MIN_SIZE / nextW, MIN_SIZE / nextH);
    nextW *= grow; nextH *= grow;
  }
  const nextLeft = sx < 0 ? startBox.right - nextW : startBox.left;
  const nextTop = sy < 0 ? startBox.bottom - nextH : startBox.top;
  const scaleX = nextW / startBox.w, scaleY = nextH / startBox.h;
  const candidates = elements.map((element) => {
    const next = {
      ...element,
      x: nextLeft + (element.x - startBox.left) * scaleX,
      y: nextTop + (element.y - startBox.top) * scaleY,
      w: Math.max(MIN_SIZE, element.w * scaleX),
      h: Math.max(MIN_SIZE, element.h * scaleY),
    };
    /* Type follows the vertical scale: a corner drag scales the words with the
       box, while dragging a side handle only makes the text box wider, which
       is what the words reflowing inside it should do. Letter spacing rides
       along because it is set against the font size, not the box. */
    if (element.type === "text") {
      if (element.fontSize) next.fontSize = Math.max(1, element.fontSize * scaleY);
      if (element.letterSpacing) next.letterSpacing = element.letterSpacing * scaleY;
    }
    return next;
  });
  const box = selectionBounds(candidates);
  const shiftX = box.left < 0 ? -box.left : box.right > CANVAS_WIDTH ? CANVAS_WIDTH - box.right : 0;
  const shiftY = box.top < 0 ? -box.top : box.bottom > CANVAS_HEIGHT ? CANVAS_HEIGHT - box.bottom : 0;
  return candidates.map((element) => ({ ...element, x: element.x + shiftX, y: element.y + shiftY }));
}

export function fitElement(element) {
  let result = { ...element, w: Math.max(MIN_SIZE, element.w), h: Math.max(MIN_SIZE, element.h) };
  let box = bounds(result);
  const ratio = Math.min(1, CANVAS_WIDTH / (box.halfW * 2), CANVAS_HEIGHT / (box.halfH * 2));
  result.w *= ratio;
  result.h *= ratio;
  box = bounds(result);
  result.x = clamp(result.x + result.w / 2, box.halfW, CANVAS_WIDTH - box.halfW) - result.w / 2;
  result.y = clamp(result.y + result.h / 2, box.halfH, CANVAS_HEIGHT - box.halfH) - result.h / 2;
  return result;
}

export function resizeElement(start, handle, dx, dy, lockAspect = false) {
  const angle = radians(start.rotation);
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const localX = dx * cos + dy * sin;
  const localY = -dx * sin + dy * cos;
  const sx = handle.includes("e") ? 1 : handle.includes("w") ? -1 : 0;
  const sy = handle.includes("s") ? 1 : handle.includes("n") ? -1 : 0;
  let w = Math.max(MIN_SIZE, start.w + sx * localX);
  let h = Math.max(MIN_SIZE, start.h + sy * localY);
  if (lockAspect && sx && sy) {
    const rx = (w - start.w) / start.w, ry = (h - start.h) / start.h;
    const ratio = Math.max(MIN_SIZE / start.w, MIN_SIZE / start.h, 1 + (Math.abs(rx) > Math.abs(ry) ? rx : ry));
    w = start.w * ratio;
    h = start.h * ratio;
  }
  function at(t) {
    const dw = (w - start.w) * t, dh = (h - start.h) * t;
    return { ...start, w: start.w + dw, h: start.h + dh,
      x: start.x + (sx * dw * cos - sy * dh * sin - dw) / 2,
      y: start.y + (sx * dw * sin + sy * dh * cos - dh) / 2 };
  }
  function fits(candidate) {
    const b = bounds(candidate);
    return b.left >= -0.001 && b.top >= -0.001 && b.right <= CANVAS_WIDTH + 0.001 && b.bottom <= CANVAS_HEIGHT + 0.001;
  }
  const candidate = at(1);
  if (fits(candidate)) return candidate;
  // Stop at the page edge while preserving the opposite resize anchor.
  let low = 0, high = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (fits(at(mid))) low = mid;
    else high = mid;
  }
  return at(low);
}

export function elementStyle(element) {
  return { left: `${element.x / CANVAS_WIDTH * 100}%`, top: `${element.y / CANVAS_HEIGHT * 100}%`,
    width: `${element.w / CANVAS_WIDTH * 100}%`, height: `${element.h / CANVAS_HEIGHT * 100}%` };
}
