import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export default function PasswordField({ label, id, value, onChange, invalid }) {
  const [visible, setVisible] = useState(false);
  return <label className="reset-field" htmlFor={id}>
    <span>{label} <b>*</b></span>
    <span className="reset-input-wrap">
      <LockKeyhole size={20} aria-hidden="true" />
      <input id={id} type={visible ? "text" : "password"} autoComplete="new-password" required
        placeholder={id === "new-password" ? "Enter your new password" : "Confirm your new password"}
        value={value} onChange={onChange} aria-invalid={invalid || undefined} aria-describedby={invalid ? "reset-error" : undefined} />
      <button type="button" className="reset-eye" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} onClick={() => setVisible(!visible)}>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
  </label>;
}

