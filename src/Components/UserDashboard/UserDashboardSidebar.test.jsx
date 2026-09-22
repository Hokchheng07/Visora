import { useState } from "react";
import { MemoryRouter } from "react-router";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import UserDashboardSidebar from "./UserDashboardSidebar";

let media;
let resize;
beforeEach(() => {
  const listeners = new Set();
  media = {
    matches: true,
    addEventListener: (_, listener) => listeners.add(listener),
    removeEventListener: (_, listener) => listeners.delete(listener),
  };
  vi.stubGlobal("matchMedia", () => media);
  resize = (mobile) => act(() => {
    media.matches = mobile;
    listeners.forEach((listener) => listener());
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function Dashboard() {
  const [open, setOpen] = useState(false);
  return (
    <MemoryRouter>
      <div>
        <UserDashboardSidebar open={open} onClose={() => setOpen(false)} />
        <div className="user-dashboard-content">
          <button onClick={() => setOpen(true)}>Open navigation</button>
        </div>
      </div>
    </MemoryRouter>
  );
}

it("keeps the user sidebar separate from global admin drawer selectors", () => {
  const { container } = render(<Dashboard />);
  expect(container.querySelector(".dashboard-sidebar")).toBeNull();
  expect(container.querySelector(".user-dashboard-sidebar")).not.toBeNull();
  expect(screen.getByRole("link", { name: "Profile" }).getAttribute("href")).toBe("/user-dashboard/profile");
});

it("releases the mobile drawer when resized to desktop and keeps it closed on return", () => {
  const { container } = render(<Dashboard />);
  const content = container.querySelector(".user-dashboard-content");
  fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
  expect(content.inert).toBe(true);
  expect(document.body.style.overflow).toBe("hidden");
  expect(document.activeElement).toBe(screen.getByRole("link", { name: "Profile" }));
  resize(false);
  expect(content.inert).not.toBe(true);
  expect(document.body.style.overflow).toBe("");
  resize(true);
  expect(container.querySelector(".user-dashboard-sidebar").getAttribute("data-open")).toBe("false");
});
