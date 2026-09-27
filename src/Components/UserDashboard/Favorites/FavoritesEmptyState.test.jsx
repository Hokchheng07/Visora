import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import FavoritesEmptyState from "./FavoritesEmptyState";

afterEach(cleanup);

describe("FavoritesEmptyState", () => {
  it("explains how to create a collection and links to templates", () => {
    render(
      <MemoryRouter>
        <FavoritesEmptyState />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Start your collection" })).toBeTruthy();
    expect(screen.getByText(/Select the heart on templates or designs you love/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore templates" }).getAttribute("href")).toBe("/templates");
  });
});
