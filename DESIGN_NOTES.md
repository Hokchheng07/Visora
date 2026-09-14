# Visora design notes

Recorded from the current source on 2026-09-13. Preserve this visual identity when extending the project; these notes describe the implementation, not a new design proposal or an independent Figma review.

## Identity and visual language

Visora is a creative event-backdrop platform with a playful, Khmer-inspired identity. Marketing pages combine Angkor and Apsara imagery with paper cutouts, hanging cards, rounded frames, organic blobs, doodled arrows, scissors, dashed connectors, waves, and subtle speckle textures. Reuse the existing assets and compositions rather than introducing an unrelated visual style.

Marketing layouts use large expressive headings, generous spacing, pastel cards, soft tinted shadows, and overlapping artwork. Editor and dashboard layouts use more restrained toolbars, sidebars, panels, and tables while retaining the brand colors and rounded controls.

## Colors

| Role | Light theme | Dark marketing theme |
| --- | --- | --- |
| Primary | Purple `#705AE0` | Sky blue `#72BFF1` |
| Secondary | Golden yellow `#FFC21C` | Magenta `#DA4EC9` |
| Accent | Lavender `#B294F0` | Pink `#E35DCB` |
| Base surface | `#FFFFFF` | `#0F0F14` |
| Warm surface | `#FFFAF0` | `#151520` |
| Card surface | `#FFFDF8` | `#1A1A28` |
| Heading | `#111111` | `#FFFFFF` |
| Body text | `#585858` | `#E2E1E1` |
| Muted text | `#666666` | `#BCBCCD` |

Use existing semantic tokens (`bg-primary`, `text-primary`, `--surface-card`, `--text-body`, etc.) for new UI. Dark marketing overrides belong to `.dark .site-shell`, not global brand overrides. Purple-to-lavender gradients appear in brand highlights; auth submit buttons use yellow through warm beige to purple. Follow the treatment of the surrounding component.

## Typography and components

- Poppins is the main UI font, exposed through `font-sans` / `--font-sans`; self-hosted weights are 400, 500, 600, and 700.
- Freehand is available as `font-handwritten` for decorative use; it is not the default UI font.
- Marketing headings commonly use weight 600, tight tracking, and compact line heights. Body copy has more relaxed line spacing.
- Cards and panels generally have generous rounded corners (roughly 18–22px in existing examples). Controls use smaller radii; badges are often pills. Match the local component rather than imposing one radius everywhere.
- Use the icon family already used by the component: the editor/dashboard primarily use Lucide; marketing/auth also use Heroicons.
- Retain visible focus states, distinct selected/disabled states, and responsive layouts. Check both palettes and narrow screens when changing visuals.

## Theme boundaries

- Marketing switches to blue/pink on dark backgrounds.
- Editor chrome supports dark mode with primary `#A78DFF`, accent `#C3AEFF`, surface `#17161F`, and workspace `#0F0E16`. Use `--editor-*` tokens, including for portalled controls.
- Dashboard uses `--dash-*` tokens. Dark mode retains lifted purple `#A78DFF`, with base `#0F0F14` and surface `#1A1A28`; status colors have their own tokens.
- Auth stays inside `.theme-light-boundary`. CV content also has a light boundary.
- Authored canvas backgrounds, elements, photographs, and template artwork retain their chosen colors in both themes and in fullscreen display. Theme surrounding UI without recoloring the document.
- Use `ThemeImage` and the registered `darkAssets` mapping for decorative asset variants.

## Motion

Reuse the shared Motion presets in `src/lib/animations/animations.js`: easing `[0.22, 1, 0.36, 1]`, typical reveal duration 0.6–0.7 seconds, and stagger 0.12 seconds. Existing controls use shorter hover/focus transitions. Respect reduced motion. The theme toggle has a 650ms diagonal ruler transition and a 180ms crossfade for reduced motion or keyboard activation.

## Source of truth

- `src/styles/foundation.css`: brand and font tokens, font files, sparkle texture.
- `src/theme/theme.css`: marketing palettes and theme boundaries.
- `src/theme/ThemeProvider.jsx`, `ThemeImage.jsx`, and `darkAssets.js`: theme behavior and artwork mapping.
- `src/Components/Editor/editor.css`: editor tokens and layout.
- `src/Components/Dashboard/dashboard.css`: dashboard tokens and layout.
- `src/styles/pages/` and `src/styles/components/`: existing marketing treatments.

Documentation caveat: `src/theme/README.md` still says the editor is light-only, but current CSS supports dark editor chrome. It also references `scripts/build-dark-artwork.mjs`, which is absent from this checkout. Follow the current source when these older notes conflict.
