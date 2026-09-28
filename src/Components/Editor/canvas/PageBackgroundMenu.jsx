import {
  gradientPageBackground, normalizePageBackground, pageBackgroundColor, solidPageBackground,
} from "../model/pageBackground.js";
import GradientColourMenu from "../ui/GradientColourMenu.jsx";

/* Canvas and text use the same paint editor. This wrapper only translates the
   page background's compatibility shape into the editor's fill/gradient pair. */
export default function PageBackgroundMenu({ background: raw, disabled, onChange }) {
  const background = normalizePageBackground(raw);
  return (
    <GradientColourMenu
      label="Background"
      heading="Canvas background"
      description="Colour the whole page."
      solid={pageBackgroundColor(background)}
      gradient={background.type === "GRADIENT" ? background.gradient : null}
      gradientTo="#705AE0"
      named
      disabled={disabled}
      onChange={({ fill, gradient }) => onChange(
        gradient ? gradientPageBackground(gradient, fill) : solidPageBackground(fill),
      )}
    />
  );
}
