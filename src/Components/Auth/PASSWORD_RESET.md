# Password reset preview

Open `/auth/forgot-password` or follow **Forgot password?** from login. The old
`/forgot-password` URL redirects here. All three steps share this route; a valid
verification response advances the form to Create New Password.

The supplied illustration is in `src/assets/pages/auth/forgot-password/`.
The layout follows the three reference screens and collapses to a single form
column on mobile. It uses the existing light auth boundary and brand tokens.

## Temporary API adapter

`src/Components/API/passwordResetApi.js` is a local demo with no network requests.
Use any valid email and code **123456**. A wrong code shows an error. The resend
button unlocks after 60 seconds, restarting only when another send succeeds.
The demo does not store credentials, send email, or change a real password.

When the mentor supplies the contract, replace `sendCode`, `verifyCode`, and
`resetPassword` with real requests and remove the demo code/behavior. Preserve
these UI-facing return shapes, or adapt the component alongside the API:

- `sendCode({ email })` → `{ challengeId, retryAfterSeconds }`; also used to resend.
- `verifyCode({ challengeId, code })` → `{ resetToken }` after server verification.
- `resetPassword({ resetToken, password })` → success or a thrown user-safe error.

These are proposed adapter shapes, not assumed backend endpoints. Set
`PASSWORD_RESET_DEMO` to false only after replacing the adapter. Keep the token
in memory; the server must validate it, enforce code expiry and rate limits, and
invalidate it after use. Match password rules to the final backend contract.
Current UI rules follow the reference: 8+ characters, upper and lower case, and
a number or special character. Reloading starts a new recovery flow.

Tests run as part of `npm test` and cover validation, wrong/correct codes,
automatic progression, cooldown/resend, confirmation and API failure feedback.
