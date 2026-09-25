import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ArrowLeft, Expand, X } from "lucide-react";
import { MAX_PAGE_SIDE, MIN_PAGE_SIDE, PAGE_PRESETS } from "../Editor/model/pageSize.js";
import CanvasPresetArtwork from "./CanvasPresetArtwork.jsx";
import "../../styles/pages/canvas-picker.css";

export default function CanvasPickerModal({ open, onClose, onCreate }) {
  const [custom, setCustom] = useState(false);
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [error, setError] = useState("");
  const previewWidth = Math.max(1, Number(width) || 1920);
  const previewHeight = Math.max(1, Number(height) || 1080);
  const previewScale = Math.min(285 / previewWidth, 200 / previewHeight);

  function close() {
    setCustom(false);
    setError("");
    onClose();
  }

  function create(size) {
    setCustom(false);
    setError("");
    onCreate(size);
  }

  function createCustom(event) {
    event.preventDefault();
    const w = Number(width);
    const h = Number(height);
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < MIN_PAGE_SIDE || h < MIN_PAGE_SIDE || w > MAX_PAGE_SIDE || h > MAX_PAGE_SIDE) {
      setError(`Enter whole numbers between ${MIN_PAGE_SIDE} and ${MAX_PAGE_SIDE} px.`);
      return;
    }
    create({ width: w, height: h });
  }

  return (
    <Dialog open={open} onClose={close} className="canvas-picker-overlay">
      <div className="canvas-picker-positioner">
        <DialogPanel className="canvas-picker-panel">
          <div className="canvas-picker-top">
            <div>
              <DialogTitle className="canvas-picker-title">{custom ? "Custom size" : "Choose your canvas"}</DialogTitle>
              <p className="canvas-picker-subtitle">{custom ? "Set the size of your blank design in pixels." : "Start with a blank design in the right size."}</p>
            </div>
            <div className="canvas-picker-actions">
              {custom ? (
                <button className="canvas-picker-custom-button" type="button" onClick={() => { setCustom(false); setError(""); }}>
                  <ArrowLeft size={18} aria-hidden="true" /> Presets
                </button>
              ) : (
                <button className="canvas-picker-custom-button" type="button" onClick={() => setCustom(true)}>
                  <Expand size={19} aria-hidden="true" /> Custom size
                </button>
              )}
              <button className="canvas-picker-close" type="button" aria-label="Close canvas picker" onClick={close}>
                <X size={26} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          </div>

          {custom ? (
            <form className="canvas-picker-custom-form" onSubmit={createCustom}>
              <div className="canvas-picker-custom-preview" aria-hidden="true"><span style={{ width: previewWidth * previewScale, height: previewHeight * previewScale }} /></div>
              <div className="canvas-picker-custom-fields">
                <div className="canvas-picker-dimensions">
                  <label>Width <span className="canvas-picker-input-wrap"><input autoFocus type="number" inputMode="numeric" min={MIN_PAGE_SIDE} max={MAX_PAGE_SIDE} step="1" value={width} onChange={(event) => { setWidth(event.target.value); setError(""); }} required /><span>px</span></span></label>
                  <span className="canvas-picker-times" aria-hidden="true">×</span>
                  <label>Height <span className="canvas-picker-input-wrap"><input type="number" inputMode="numeric" min={MIN_PAGE_SIDE} max={MAX_PAGE_SIDE} step="1" value={height} onChange={(event) => { setHeight(event.target.value); setError(""); }} required /><span>px</span></span></label>
                </div>
                <p className="canvas-picker-range">Each side can be {MIN_PAGE_SIDE}–{MAX_PAGE_SIDE} px.</p>
                {error && <p className="canvas-picker-error" role="alert">{error}</p>}
                <button className="canvas-picker-create" type="submit">Create design</button>
              </div>
            </form>
          ) : (
            <div className="canvas-picker-presets">
              <h3>Popular sizes</h3>
              <div className="canvas-picker-grid">
                {PAGE_PRESETS.map((preset) => (
                  <button key={preset.id} type="button" className="canvas-picker-card" onClick={() => create({ width: preset.width, height: preset.height })}>
                    <span className="canvas-picker-art-stage" aria-hidden="true"><CanvasPresetArtwork id={preset.id} /></span>
                    <span className="canvas-picker-card-label">{preset.label}</span>
                    <span className="canvas-picker-card-size">{preset.width} × {preset.height} px</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
