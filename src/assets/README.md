# Asset organization

Assets are organized by ownership rather than file type:

- `shared/` contains branding, social icons, and textures used across routes.
- `sections/` contains persistent site chrome such as the navbar and footer.
- `pages/<route>/<section>/` contains artwork owned by one page section.
- A section's `dark/` folder contains the dark-mode counterpart of its light artwork.
- About-page artwork reused by multiple sections lives in `pages/about/shared/`.

When adding artwork, place it with the component that owns it. Only promote an
asset to `shared/` after more than one route genuinely uses it.
