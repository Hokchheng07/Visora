// Temporary demo adapter. Replace these three methods when the mentor supplies
// the API contract; do not invent production endpoints or store credentials.
// The server must enforce code expiry, resend limits and one-use reset tokens.
export const PASSWORD_RESET_DEMO = true;
export const DEMO_RESET_CODE = "123456";
export const RESEND_DELAY_SECONDS = 60;

const demoResponse = () => new Promise((resolve) => setTimeout(resolve, 350));

export const passwordResetApi = {
  async sendCode({ email }) {
    await demoResponse();
    if (!email) throw new Error("Enter your email address.");
    return { challengeId: "demo-challenge", retryAfterSeconds: RESEND_DELAY_SECONDS };
  },
  async verifyCode({ challengeId, code }) {
    await demoResponse();
    if (challengeId !== "demo-challenge" || code !== DEMO_RESET_CODE) {
      throw new Error("That code is incorrect. Please try again.");
    }
    return { resetToken: "demo-reset-token" };
  },
  async resetPassword({ resetToken, password }) {
    await demoResponse();
    if (resetToken !== "demo-reset-token" || !password) {
      throw new Error("Please verify your code before resetting your password.");
    }
    // Intentionally no network request, logging, or persistence.
    return { demo: true };
  },
};
