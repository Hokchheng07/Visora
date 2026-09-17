# Marketing theme

`ThemeProvider` owns the saved preference (`visora-theme`) and resolved appearance.
The head script in `index.html` uses the same resolution rules before React loads.
Without a saved light/dark preference, system changes are followed. Storage errors
are tolerated; storage events synchronize other tabs.

Brand overrides belong to `.dark .site-shell`. The editor and auth shell explicitly
use the light color scheme. The CV content has a light boundary inside the themed
marketing layout. User-authored shapes and template images never get recolored.

`ThemeImage` maps only registered decorative assets. Regenerate committed SVG
variants with `node scripts/build-dark-artwork.mjs` when source assets change.
This preserves path geometry and embedded photographs. Feature cards contain text
as paths, so their dark variants also remap the ink and translucent background.

The ruler uses same-document View Transitions and WAAPI: a 650ms 45-degree sweep
with a matching polygon mask. Percentages avoid high-DPI WebKit snapshot scaling
issues. Both directions reveal from upper-right toward lower-left. The animated
ruler is a named transition snapshot above the page snapshot. Repeated activations
are ignored during the transition, while keyboard focus is retained. Reduced
motion and keyboard activation use the 180ms crossfade. Without View Transitions,
the theme applies immediately. Failed transitions also apply the theme and clean up.

Visual verification: desktop and 390px mobile, both palettes, mid-sweep at 4x
duration (restored to 650ms), template/feature cards, How It Works, Events carousel,
footer, mobile navigation, fresh page load and cross-tab preference synchronization.
