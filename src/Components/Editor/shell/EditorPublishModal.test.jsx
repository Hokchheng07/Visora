import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { loadPublishedTemplates } from "../model/templatePublish.js";
import EditorPublishModal from "./EditorPublishModal.jsx";

vi.mock("../../redux/hook.js", () => ({
  useAppSelector: (selector) => selector({ editor: {
    title: "Test backdrop",
    canvas: { width: 1920, height: 1080 },
    pages: [{ id: "page-1", elements: [] }],
  } }),
}));
vi.mock("../export/editorPdf.jsx", () => ({ renderPage: () => Promise.resolve("data:image/png;base64,abc") }));

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("EditorPublishModal", () => {
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
