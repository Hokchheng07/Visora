import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { ReviewQueueEmptyState } from "./AdminUi";

afterEach(cleanup);

describe("ReviewQueueEmptyState", () => {
  it("explains the cleared queue and links to template management", () => {
    const { container } = render(
      <MemoryRouter>
        <ReviewQueueEmptyState compact />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Queue is clear" })).toBeTruthy();
    expect(screen.getByText("No templates are waiting for review right now.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Browse all templates" }).getAttribute("href")).toBe("/dashboard/templates");
    expect(container.querySelector(".ad-review-empty.is-compact")).toBeTruthy();
  });
});
