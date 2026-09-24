import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPassword from "./ForgotPassword.jsx";
import { ThemeProvider } from "../../theme/ThemeProvider.jsx";
import { passwordResetApi } from "../API/passwordResetApi.js";

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
const settle = () => act(async () => { await vi.advanceTimersByTimeAsync(400); });
// jsdom has no matchMedia; ThemeProvider reads the system scheme through it.
window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
function openPage() { render(<ThemeProvider><MemoryRouter><ForgotPassword /></MemoryRouter></ThemeProvider>); }
async function sendCode() {
  fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: "creator@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
  await settle();
}
function pasteCode(code) {
  fireEvent.paste(screen.getByLabelText("Digit 1"), { clipboardData: { getData: () => code } });
}

describe("password recovery preview", () => {
  it("validates email, rejects a wrong code, and automatically advances only on a valid code", async () => {
    const verify = vi.spyOn(passwordResetApi, "verifyCode");
    openPage();
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    expect(screen.getByRole("alert").textContent).toContain("valid email");
    await sendCode();
    fireEvent.change(screen.getByLabelText("Digit 1"), { target: { value: "12" } });
    expect(verify).not.toHaveBeenCalled();
    pasteCode("000000");
    expect(screen.getByLabelText("Digit 1").matches(":disabled")).toBe(true);
    await settle();
    expect(screen.getByRole("alert").textContent).toContain("incorrect");
    expect(screen.queryByLabelText(/^New Password/)).toBeNull();
    pasteCode("123456");
    await settle();
    expect(verify).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText(/^New Password/)).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 })).toBe(document.activeElement);
  });

  it("enforces the 60 second resend cooldown and restarts it after a resend", async () => {
    const send = vi.spyOn(passwordResetApi, "sendCode");
    openPage(); await sendCode();
    expect(screen.getByRole("button", { name: /Resend code in 01:00/ }).disabled).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    const resend = screen.getByRole("button", { name: "Resend code" });
    expect(resend.disabled).toBe(false);
    fireEvent.click(resend); await settle();
    expect(send).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: /Resend code in 01:00/ }).disabled).toBe(true);
  });

  it("checks password rules and confirmation before completing the demo", async () => {
    const reset = vi.spyOn(passwordResetApi, "resetPassword");
    openPage(); await sendCode(); pasteCode("123456"); await settle();
    const submit = () => fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));
    fireEvent.change(screen.getByLabelText(/^New Password/), { target: { value: "short" } });
    submit(); expect(screen.getByRole("alert").textContent).toContain("requirements");
    fireEvent.change(screen.getByLabelText(/^New Password/), { target: { value: "NewPassword9" } });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password/), { target: { value: "different" } });
    submit(); expect(screen.getByRole("alert").textContent).toContain("do not match");
    expect(reset).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/^Confirm New Password/), { target: { value: "NewPassword9" } });
    submit(); await settle();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Demo Complete" })).toBeTruthy();
    expect(screen.getByText(/real password has not changed/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to Login" }).getAttribute("href")).toBe("/auth/login");
  });

  it("keeps the email step usable if sending fails", async () => {
    vi.spyOn(passwordResetApi, "sendCode").mockRejectedValueOnce(new Error("Unable to send. Try again."));
    openPage(); await sendCode();
    expect(screen.getByRole("alert").textContent).toContain("Unable to send");
    expect(screen.getByRole("button", { name: "Send Verification Code" }).disabled).toBe(false);
    expect(screen.queryByLabelText("Digit 1")).toBeNull();
  });
});
