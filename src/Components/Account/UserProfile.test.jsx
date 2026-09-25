import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router";
import { ThemeProvider } from "../../theme/ThemeProvider";
import UserProfile from "./UserProfile";
import UserMenu from "./UserMenu";
import Navbar from "../Nav/Navbar";
import UserDashboardHeader from "../UserDashboard/UserDashboardHeader";
import EditorTopBar from "../Editor/shell/EditorTopBar";

const mocks = vi.hoisted(() => ({ account: vi.fn(), dispatch: vi.fn() }));
vi.mock("./useCurrentUser", () => ({ useCurrentUser: mocks.account }));
vi.mock("../redux/hook.js", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (select) => select({ editor: { past: [], future: [], title: "Test design" } }),
}));
vi.mock("../redux/authslice", () => ({ setLogout: () => ({ type: "test/logout" }) }));
vi.mock("../API/baseApi", () => ({ baseApi: { util: { resetApiState: () => ({ type: "test/reset-cache" }) } } }));
vi.mock("../Editor/shell/EditorImportButton.jsx", () => ({ default: () => null }));
vi.mock("../Editor/shell/EditorExportMenu.jsx", () => ({ default: () => null }));

const account = {
  isSignedIn: true, isLoading: false, displayName: "Ada Lovelace",
  initials: "AL", pictureUrl: "/ada.png", user: { email: "ada@example.com" },
  role: "USER", isAdmin: false,
};
const profile = { name: "Dashboard name", handle: "dashboard-handle", avatarUrl: "/dashboard.png" };

function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function mount(component, route = "/templates") {
  return render(<MemoryRouter initialEntries={[route]}><ThemeProvider>{component}<Location /></ThemeProvider></MemoryRouter>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.account.mockReturnValue(account);
  localStorage.clear();
  localStorage.setItem("visora-theme", "light");
  document.documentElement.classList.remove("dark");
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("shared header profile", () => {
  it.each([
    ["Navbar", () => <Navbar />],
    ["Editor", () => <EditorTopBar />],
  ])("preserves the %s account menu, profile route and dismissal", (_, component) => {
    const { container } = mount(component());
    const trigger = screen.getByRole("button", { name: "Account menu for Ada Lovelace" });
    expect(container.querySelector(".user-avatar-frame-art").getAttribute("src")).toContain("pf-frame-light.png");
    fireEvent.click(trigger);
    expect(screen.getByRole("menu").getAttribute("data-open")).toBe("true");
    expect(screen.queryByRole("menuitem", { name: "Admin dashboard" })).toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: "My profile" }));
    expect(screen.getByTestId("location").textContent).toBe("/profile");
  });

  it("keeps admin permissions and clears authentication and cache on account logout", () => {
    mocks.account.mockReturnValue({ ...account, isAdmin: true, role: "ADMIN" });
    mount(<UserProfile />);
    fireEvent.click(screen.getByRole("button", { name: /Account menu/ }));
    expect(screen.getByRole("menuitem", { name: "Admin dashboard" }).getAttribute("href")).toBe("/dashboard");
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));
    expect(mocks.dispatch.mock.calls).toEqual([[{ type: "test/logout" }], [{ type: "test/reset-cache" }]]);
    expect(screen.getByTestId("location").textContent).toBe("/");
  });

  it("keeps the signed-out fallback and existing unframed UserMenu callers", () => {
    mocks.account.mockReturnValue({ isSignedIn: false });
    const { unmount } = mount(<UserProfile signedOut={<span>Sign in fallback</span>} />);
    expect(screen.getByText("Sign in fallback")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Account menu/ })).toBeNull();
    unmount();
    mocks.account.mockReturnValue(account);
    const { container } = mount(<UserMenu showMeta />);
    expect(container.querySelector(".user-avatar-frame-art")).toBeNull();
    expect(screen.getByRole("button", { name: "Account menu for Ada Lovelace" }).textContent).toContain("Ada Lovelace");
  });

  it("uses the dashboard profile and switches both frames through the existing theme provider", () => {
    const { container } = mount(<UserDashboardHeader profile={profile} />, "/user-dashboard/profile");
    const trigger = screen.getByRole("button", { name: "User menu" });
    fireEvent.click(trigger);
    expect(screen.getByText("Dashboard name")).toBeTruthy();
    expect(screen.getByText("@dashboard-handle")).toBeTruthy();
    expect(mocks.account).not.toHaveBeenCalled();
    const frames = [...container.querySelectorAll(".user-avatar-frame-art")];
    const sizes = frames.map((frame) => frame.parentElement.getAttribute("style"));
    expect(frames).toHaveLength(2);
    expect(frames.every((frame) => frame.src.includes("pf-frame-light.png"))).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(frames.every((frame) => frame.src.includes("pf-frame-dark.png"))).toBe(true);
    expect(frames.map((frame) => frame.parentElement.getAttribute("style"))).toEqual(sizes);
    expect(localStorage.getItem("visora-theme")).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(frames.every((frame) => frame.src.includes("pf-frame-light.png"))).toBe(true);
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(screen.getByTestId("location").textContent).toBe("/");
  });

  it("still closes the dashboard menu on outside click and when scrolling hides its header", () => {
    mount(<UserDashboardHeader profile={profile} />);
    const trigger = screen.getByRole("button", { name: "User menu" });
    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(trigger);
    vi.stubGlobal("scrollY", 100);
    fireEvent.scroll(window);
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
