import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../redux/hook.js";
import { documentLoaded } from "../redux/editorSlice.js";

export function useCanvasPicker() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const create = (size) => {
    dispatch(documentLoaded({ canvas: size }));
    setOpen(false);
    navigate("/editor");
  };

  return { open, show: () => setOpen(true), close: () => setOpen(false), create };
}
