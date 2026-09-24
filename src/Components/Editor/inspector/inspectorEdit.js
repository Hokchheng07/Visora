import { useCallback, useEffect, useRef } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { useAppDispatch } from "../../redux/hook.js";
import { editCancelled, editFinished, editStarted, editUpdated } from "../../redux/editorSlice.js";

/* What an inspector field writes to, and how. Kept apart from the field
   components so this file can be tested without rendering. */

export const elementsTarget = (pageId, ids) => ({ kind: "elements", pageId, ids });
export const timerTarget = (pageId, id) => ({ kind: "timer", pageId, ids: [id] });
export const pageTarget = (pageId) => ({ kind: "page", pageId });
export const groupTarget = (pageId, groupId) => ({ kind: "group", pageId, groupId });

/* One edit session for one control. The window listeners end a drag even when
   the pointer is released outside the control or the window loses focus, so a
   lost pointer can never leave a session open. Unmounting commits. */
export function useEditSession() {
  const dispatch = useAppDispatch();
  const token = useRef(null);
  const detach = useRef(null);

  const release = useCallback(() => {
    detach.current?.();
    detach.current = null;
    token.current = null;
  }, []);

  const finish = useCallback(() => {
    if (!token.current) return;
    dispatch(editFinished(token.current));
    release();
  }, [dispatch, release]);

  const cancel = useCallback(() => {
    if (!token.current) return false;
    dispatch(editCancelled(token.current));
    release();
    return true;
  }, [dispatch, release]);

  const begin = useCallback((target, property) => {
    if (token.current) return token.current;
    const id = nanoid();
    token.current = id;
    dispatch(editStarted({ token: id, target, property }));
    const end = () => finish();
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    window.addEventListener("blur", end);
    detach.current = () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("blur", end);
    };
    return id;
  }, [dispatch, finish]);

  const update = useCallback((target, property, changes) => {
    dispatch(editUpdated({ token: begin(target, property), changes }));
  }, [begin, dispatch]);

  useEffect(() => finish, [finish]);
  return { begin, update, finish, cancel, active: () => token.current !== null };
}

export const normalizeRotation = (degrees) => ((Math.round(degrees) % 360) + 360) % 360;

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
export function parseHex(raw) {
  const match = HEX.exec(String(raw).trim());
  if (!match) return null;
  const digits = match[1].length === 3 ? match[1].split("").map((digit) => digit + digit).join("") : match[1];
  return `#${digits.toUpperCase()}`;
}

