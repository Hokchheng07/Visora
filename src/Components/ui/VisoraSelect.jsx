import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

/*
 * Site-wide select control. Native <select> menus are painted by the browser
 * or operating system, so they cannot carry Visora's colours, spacing or dark
 * theme. Headless UI keeps the expected keyboard and screen-reader behaviour
 * while every visible surface remains ours.
 */
export default function VisoraSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Choose an option",
  disabled = false,
  tone = "site",
  size = "default",
  className = "",
  buttonClassName = "",
  panelClassName = "",
  startIcon = null,
  prefix = null,
  anchor = "bottom start",
}) {
  const normalized = options.map((option) => (
    typeof option === "string" ? { value: option, label: option } : option
  ));
  const current = normalized.find((option) => option.value === value);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={`visora-select visora-select--${tone} visora-select--${size} ${className}`.trim()}>
        <ListboxButton
          type="button"
          className={`visora-select-button ${buttonClassName}`.trim()}
          aria-label={label}
        >
          {startIcon && <span className="visora-select-leading" aria-hidden="true">{startIcon}</span>}
          {prefix && <span className="visora-select-prefix">{prefix}</span>}
          <span className={`visora-select-value${current ? "" : " is-placeholder"}`}>
            {current?.label ?? placeholder}
          </span>
          <ChevronDown className="visora-select-caret" size={16} strokeWidth={2.25} aria-hidden="true" />
        </ListboxButton>
        <ListboxOptions
          anchor={{ to: anchor, gap: 6, padding: 10 }}
          modal={false}
          transition
          className={`visora-select-options visora-select-options--${tone} ${panelClassName}`.trim()}
        >
          {normalized.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="visora-select-option"
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={15} strokeWidth={2.5} aria-hidden="true" />}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
