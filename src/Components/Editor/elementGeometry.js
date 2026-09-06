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
