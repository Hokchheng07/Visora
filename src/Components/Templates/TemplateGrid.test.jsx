import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useGetTemplateByIdQuery: vi.fn(),
}));

vi.mock("../API/templateApi", () => ({
  useGetTemplateByIdQuery: mocks.useGetTemplateByIdQuery,
}));

vi.mock("./TemplateCard", () => ({
  default: ({ template, onPreview }) => (
    <article>
      <h2>{template.title}</h2>
      <p>{template.description}</p>
      <button type="button" onClick={onPreview}>Preview</button>
    </article>
  ),
}));

vi.mock("./Pagination", () => ({ default: () => null }));
vi.mock("../ui/VisoraLoader", () => ({ default: () => null }));

import TemplateGrid from "./TemplateGrid";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TemplateGrid", () => {
  it("hydrates a posted card with the submitted description", () => {
    const onPreview = vi.fn();
    mocks.useGetTemplateByIdQuery.mockReturnValue({
      data: {
        data: {
          name: "Examination countdown",
          description: "A focused countdown template for timed examinations.",
        },
      },
    });

    render(
      <TemplateGrid
        templates={[{
          id: "template-123",
          remoteId: "123",
          title: "Examination countdown",
          description: "",
        }]}
        activeCategory="All"
        isFavorite={() => false}
        onFavorite={vi.fn()}
        onUse={vi.fn()}
        onPreview={onPreview}
        onReset={vi.fn()}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText("A focused countdown template for timed examinations.")).toBeTruthy();
    expect(mocks.useGetTemplateByIdQuery).toHaveBeenCalledWith(
      { templateUuid: "123" },
      { skip: false }
    );

    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({
      remoteId: "123",
      description: "A focused countdown template for timed examinations.",
    }));
  });
});
