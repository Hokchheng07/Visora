import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, expect, it, vi } from "vitest";

import DashboardLayout from "./DashboardLayout";

vi.mock("../Effects/CosmicDust.jsx", () => ({
  default: ({ particleCount }) => <canvas className="cosmic-dust" data-particle-count={particleCount} />,
}));

vi.mock("../../theme/ThemeToggle", () => ({
  default: () => <button type="button">Theme</button>,
}));

vi.mock("../Account/UserMenu", () => ({
  default: ({ signedOut }) => signedOut,
}));

afterEach(cleanup);

it("places the shared cosmic dust field behind the admin workspace", () => {
  const { container } = render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <DashboardLayout />
    </MemoryRouter>,
  );

  const main = container.querySelector(".dashboard-main");
  const dust = main.querySelector(".cosmic-dust");
  const layer = main.querySelector(".dashboard-main-layer");

  expect(dust).not.toBeNull();
  expect(dust.getAttribute("data-particle-count")).toBe("120");
  expect(layer).not.toBeNull();
  expect(main.firstElementChild).toBe(dust);
});
