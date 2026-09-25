import { StrictMode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import VerifyEmail from "./VerifyEmail";

const requests = vi.hoisted(() => ({ verify: vi.fn(), resend: vi.fn() }));

vi.mock("../API/authApi", () => ({
  useVerifyEmailMutation: () => [requests.verify],
  useResendVerificationMutation: () => [requests.resend, { isLoading: false }],
}));
vi.mock("../../theme/ThemeImage", () => ({
  ThemeImage: ({ src, alt }) => <img src={src} alt={alt} />,
}));

function page(url, strict = false) {
  const content = (
    <MemoryRouter initialEntries={[url]}>
      <Routes><Route path="/auth/verify-email" element={<VerifyEmail />} /></Routes>
    </MemoryRouter>
  );
  return render(strict ? <StrictMode>{content}</StrictMode> : content);
}

beforeEach(() => {
  requests.verify.mockReset();
  requests.resend.mockReset();
  requests.verify.mockReturnValue({ unwrap: () => Promise.resolve({ success: true }) });
  requests.resend.mockReturnValue({ unwrap: () => Promise.resolve({ success: true }) });
});
afterEach(cleanup);

it("shows the short check-inbox page and resends to the registered email", async () => {
  page("/auth/verify-email?email=you%40example.com");
  expect(screen.getByRole("heading", { name: "Check your inbox" })).toBeTruthy();
  expect(screen.getByText("you@example.com")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Resend link" }));
  await waitFor(() => expect(requests.resend).toHaveBeenCalledWith({ email: "you@example.com" }));
  expect(await screen.findByText("New link sent. Check your inbox.")).toBeTruthy();
});

it("lets a direct visitor enter an address before requesting a new link", async () => {
  page("/auth/verify-email");
  fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), { target: { value: "new@example.com" } });
  expect(screen.getByRole("textbox", { name: "Email address" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Resend link" }));
  await waitFor(() => expect(requests.resend).toHaveBeenCalledWith({ email: "new@example.com" }));
});

it("verifies a link token once in Strict Mode and offers login", async () => {
  page("/auth/verify-email?token=one-time-token", true);
  await screen.findByRole("heading", { name: "Email verified" });
  expect(requests.verify).toHaveBeenCalledTimes(1);
  expect(requests.verify).toHaveBeenCalledWith({ token: "one-time-token" });
  expect(screen.getByRole("link", { name: "Login" }).getAttribute("href")).toBe("/auth/login");
});

it("offers a resend when verification fails", async () => {
  requests.verify.mockReturnValue({ unwrap: () => Promise.reject({ status: 400 }) });
  page("/auth/verify-email?token=expired&email=you%40example.com");
  await screen.findByRole("heading", { name: "Link expired" });
  expect(screen.getByText("This verification link is invalid or has expired.")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Resend link" })).toBeTruthy();
});
