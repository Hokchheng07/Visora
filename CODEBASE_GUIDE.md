# Codebase guide

## Where to make changes

| Responsibility | Location |
| --- | --- |
| Routes and app providers | `src/main.jsx` |
| Shared app wrapper | `src/App.jsx` |
| Marketing page shell | `src/Layout.jsx` |
| Home, About, Editor route components | `src/Components/Pages/` |
| Login, registration, password recovery | `src/Components/Auth/` |
| Shared auth layout | `src/Components/Layout/auth/AuthLayout.jsx` |
| API adapters and RTK Query endpoints | `src/Components/API/` |
| Redux store and editor state | `src/Components/redux/` |
| Canvas, tools, timers, display, document persistence | `src/Components/Editor/` |
| Admin screens and their current in-memory data | `src/Components/Dashboard/` |
| Home sections and template showcase | `src/Components/Hero/`, `src/Components/LandingPageComponents/` |
| About sections | `src/Components/AboutPageComponents/` |
| Navigation and footer | `src/Components/Nav/`, `src/Components/Footer/` |
| Brand tokens and fonts | `src/styles/foundation.css` |
| Marketing styles | `src/styles/pages/`, `src/styles/components/` |
| Theme preference, palettes and artwork variants | `src/theme/` |
| Shared animation helpers | `src/lib/animations/` |
| Images imported by components | `src/assets/`, grouped by page/section |
| Fonts and assets served by root URL | `public/` |

`src/index.css` is the CSS entrypoint. Keep feature styling with its existing
owner; see [Design notes](DESIGN_NOTES.md) for palette and theme boundaries.
Paths are case-sensitive on deployment: preserve `Components`, `API`, and other
existing names when importing.

## Password recovery ownership

- `src/Components/Auth/ForgotPassword.jsx`: route page, layout and step markup.
- `src/Components/Auth/forgot-password/usePasswordReset.js`: flow state, API
  orchestration, verification, 60-second resend countdown and focus handling.
- `src/Components/Auth/forgot-password/passwordResetValidation.js`: email schema
  and password requirements shared by the UI and flow logic.
- `src/Components/Auth/forgot-password/PasswordField.jsx`: password input and
  visibility control.
- `src/Components/Auth/forgot-password.css`: responsive styles for this page.
- `src/Components/API/passwordResetApi.js`: temporary API adapter; replace this
  when the backend contract arrives.
- `src/Components/Auth/ForgotPassword.test.jsx`: existing flow checks.
- `src/Components/Auth/PASSWORD_RESET.md`: integration details and demo behavior.

The page uses the hook; the hook calls the adapter. Passwords and reset tokens
stay in component memory. Removing the on-screen demo banner did not connect a
backend or change the adapter's behavior.

## Conventions for future work

Follow the project's existing styling and file organization when extending a
feature. Keep `forgot-password.css` beside its route page in `Components/Auth`,
imported by `ForgotPassword.jsx`, consistent with the existing feature-owned CSS
pattern. Reuse the foundation tokens and light auth boundary. Do not introduce
a new styling system or move files solely for a different organization preference.

1. Find the existing feature owner before creating a file. Add feature-only
   components and hooks under that feature; shared hooks belong in `src/hooks/`
   only when they actually serve multiple features.
2. Keep route registration in `main.jsx`, API details in `Components/API`, and
   substantial workflow logic out of page markup.
3. Keep related assets under `src/assets/pages/<page>/` and import them. Use
   `public/` for resources requiring stable root-relative URLs.
4. Match the surrounding naming convention: PascalCase React components,
   `use...` hooks, descriptive camelCase JS modules, and existing CSS names.
5. Check imports before moving files. Update route imports, test globs, asset
   paths and documentation together. Avoid broad folder renames during a
   feature change.

## Current structure observations

The editor already separates components, hooks, geometry, persistence and state
well. Password recovery now follows that pattern. The broader repository mixes
page-based marketing folders with functional folders; use the map above rather
than assuming all route pages are in `Pages`.

There are two `WhyChooseVisora.jsx` files, in `Components/Features` and
`Components/LandingPageComponents/Features`. Check their actual importers before
editing or consolidating them. Dashboard seed data and frontend-only auth are
implementation gaps, not file organization problems.

## Local commands

- `npm run dev`: start Vite.
- `npm run lint`: static checks.
- `npm test`: editor unit tests and editor/auth render tests.
- `npm run build`: validate the production module graph and build assets.

The test scripts currently target explicit editor/auth globs in `package.json`;
update them if tests move to other folders. Run checks relevant to new changes,
not repeatedly against unchanged work.
