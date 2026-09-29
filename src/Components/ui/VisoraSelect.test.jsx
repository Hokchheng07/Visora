import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import VisoraSelect from "./VisoraSelect.jsx";

afterEach(cleanup);

describe("VisoraSelect", () => {
  it("renders Visora-owned options and returns the chosen value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <VisoraSelect
        label="Category"
        value="workshop"
        onChange={onChange}
        options={[
          { value: "exam", label: "Examination" },
          { value: "workshop", label: "Workshop" },
          { value: "graduation", label: "Graduation" },
        ]}
      />,
    );

    expect(container.querySelector("select")).toBe(null);
    expect(screen.getByRole("button", { name: "Category" }).textContent).toContain("Workshop");
    fireEvent.click(screen.getByRole("button", { name: "Category" }));
    fireEvent.click(screen.getByRole("option", { name: "Graduation" }));
    expect(onChange).toHaveBeenCalledWith("graduation");
  });

  it("keeps unavailable choices visible but disabled", () => {
    render(
      <VisoraSelect
        label="Group by"
        value="daily"
        onChange={() => {}}
        options={[
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly", disabled: true },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Group by" }));
    expect(screen.getByRole("option", { name: "Weekly" }).getAttribute("aria-disabled")).toBe("true");
  });
});
