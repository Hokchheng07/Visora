import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import CategoryManagement from "./CategoryManagement";

const api = vi.hoisted(() => ({
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
}));

vi.mock("../API/categoryApi", () => ({
  useGetCategoriesQuery: () => ({
    data: {
      data: {
        contents: [{
          uuid: "category-1",
          name: "Workshop",
          description: "Hands-on sessions",
          isActive: true,
          templateCount: 2,
          createdAt: "2026-09-25T07:00:00.000Z",
        }],
      },
    },
    isLoading: false,
    isError: false,
  }),
  useCreateCategoryMutation: () => [api.createCategory, { isLoading: false }],
  useUpdateCategoryMutation: () => [api.updateCategory, { isLoading: false }],
  useDeleteCategoryMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock("./AdminUi", () => ({
  AdminNotice: ({ title, message, onDismiss }) => (
    <aside role="status">{title}{message}<button type="button" onClick={onDismiss}>Dismiss notification</button></aside>
  ),
  Modal: ({ children }) => <div>{children}</div>,
  Pagination: () => null,
  RowMenu: ({ items }) => (
    <div>{items.map((item) => <button key={item.label} type="button" onClick={item.onSelect}>{item.label}</button>)}</div>
  ),
  formatDate: () => "Sep 25, 2026",
}));

beforeEach(() => {
  api.createCategory.mockReset();
  api.createCategory.mockReturnValue({ unwrap: () => Promise.resolve() });
  api.updateCategory.mockReset();
  api.updateCategory.mockReturnValue({ unwrap: () => Promise.resolve() });
});

it("lets an admin add a category from the toolbar", async () => {
  render(<CategoryManagement />);

  fireEvent.click(screen.getByRole("button", { name: "Add category" }));
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Celebration" } });
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Milestones and parties" } });
  fireEvent.click(screen.getByRole("button", { name: "Add Category" }));

  await waitFor(() => expect(api.createCategory).toHaveBeenCalledWith({
    name: "Celebration",
    slug: "celebration",
    description: "Milestones and parties",
    icon: "shapes",
    displayOrder: 1,
    isActive: true,
  }));

  const notice = await screen.findByRole("status");
  expect(notice.textContent).toContain("Category added");
  expect(notice.textContent).toContain("Celebration is ready to use.");
});

afterEach(cleanup);

it("shows Visora's confirmation after an admin updates a category", async () => {
  render(<CategoryManagement />);

  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Creative Workshop" } });
  fireEvent.click(screen.getByRole("button", { name: "Save Category" }));

  const notice = await screen.findByRole("status");
  expect(notice.textContent).toContain("Category updated");
  expect(notice.textContent).toContain("Creative Workshop was saved successfully.");
  expect(api.updateCategory).toHaveBeenCalledOnce();

  fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
  await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
});
