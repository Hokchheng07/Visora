import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { loadPublishedTemplates } from "../model/templatePublish.js";
import EditorPublishModal from "./EditorPublishModal.jsx";

const categoryFixture = vi.hoisted(() => ({ contents: [] }));

vi.mock("../../redux/hook.js", () => ({
  useAppSelector: (selector) => selector({ editor: {
    title: "Test backdrop",
    canvas: { width: 1920, height: 1080 },
    pages: [{ id: "page-1", elements: [] }],
  } }),
}));
vi.mock("../export/editorPdf.jsx", () => ({ renderPage: () => Promise.resolve("data:image/png;base64,abc") }));
vi.mock("../../Account/useCurrentUser", () => ({ useCurrentUser: () => ({ isSignedIn: true }) }));
vi.mock("../../API/categoryApi", () => ({ useGetCategoriesQuery: () => ({ data: { data: { contents: categoryFixture.contents } }, isLoading: false }) }));
// The API calls are usePublishBackdrop's (its own tests); here it succeeds and keeps the record.
vi.mock("./usePublishBackdrop.js", async () => {
  const { buildTemplateRecord, publishTemplate } = await import("../model/templatePublish.js");
  return {
    publishErrorMessage: () => "failed",
    usePublishBackdrop: () => (options) => publishTemplate(buildTemplateRecord(options)),
  };
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  categoryFixture.contents = [];
});

describe("EditorPublishModal", () => {
  it("uses the active admin categories in a custom picker", async () => {
    categoryFixture.contents = [
      { uuid: "exam", name: "Examination", isActive: true },
      { uuid: "old", name: "Archived", isActive: false },
    ];
    render(<MemoryRouter><EditorPublishModal onClose={vi.fn()} /></MemoryRouter>);

    const category = screen.getByRole("button", { name: "Category" });
    fireEvent.click(category);
    expect(await screen.findByRole("option", { name: "Examination" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Archived" })).toBeNull();
    expect(screen.getByRole("button", { name: "Submit for review" }).disabled).toBe(true);
    fireEvent.click(screen.getByRole("option", { name: "Examination" }));
    expect(category.textContent).toContain("Examination");
    expect(screen.getByRole("button", { name: "Submit for review" }).disabled).toBe(false);
  });

  it("closes the category picker with Escape without closing Publish", async () => {
    categoryFixture.contents = [{ uuid: "exam", name: "Examination", isActive: true }];
    const onClose = vi.fn();
    render(<MemoryRouter><EditorPublishModal onClose={onClose} /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Category" }));
    const listbox = await screen.findByRole("listbox");
    fireEvent.keyDown(listbox, { key: "Escape" });

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Publish Template" })).toBeTruthy();
  });

  it("takes one category: a second choice replaces the first", async () => {
    categoryFixture.contents = [
      { uuid: "exam", name: "Examination", isActive: true },
      { uuid: "school", name: "School Event", isActive: true },
    ];
    render(<MemoryRouter><EditorPublishModal onClose={vi.fn()} /></MemoryRouter>);

    const category = screen.getByRole("button", { name: "Category" });
    fireEvent.click(category);
    fireEvent.click(await screen.findByRole("option", { name: "Examination" }));
    fireEvent.click(category);
    fireEvent.click(await screen.findByRole("option", { name: "School Event" }));

    expect(category.textContent).toContain("School Event");
    expect(category.textContent).not.toContain("Examination");
    expect(screen.queryByText(/of 5 selected/)).toBeNull();
  });

  it("shows the review receipt only after a successful public submission", async () => {
    const onClose = vi.fn();
    render(<MemoryRouter><EditorPublishModal onClose={onClose} /></MemoryRouter>);

    await screen.findByRole("img", { name: "Template thumbnail" });

    expect(screen.getByRole("button", { name: "Public" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Private" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Team" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Submit for review" }));

    expect(await screen.findByRole("heading", { name: "Your backdrop is in review" })).toBeTruthy();
    expect(document.querySelector(".editor-publish-review-art-preview img")?.getAttribute("src"))
      .toBe("data:image/png;base64,abc");
    expect(document.querySelector(".editor-publish-review-design-image img")?.getAttribute("src"))
      .toBe("data:image/png;base64,abc");
    expect(screen.getByRole("button", { name: "View my designs" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back to editor" }));
    expect(onClose).toHaveBeenCalledWith(true);
    expect(loadPublishedTemplates()[0].status).toBe("pending");
  });

  it("saves a private backdrop without showing the review receipt", async () => {
    const onClose = vi.fn();
    render(<MemoryRouter><EditorPublishModal onClose={onClose} /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Private" }));
    fireEvent.click(screen.getByRole("button", { name: "Save privately" }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledWith(true));
    expect(screen.queryByRole("heading", { name: "Your backdrop is in review" })).toBeNull();
    expect(loadPublishedTemplates()[0].status).toBe("private");
  });
});
