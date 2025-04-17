import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CloseButton } from "./Button";

describe("<CloseButton>", () => {
  it("uses the ariaLabel prop to set its accessible name", async () => {
    render(<CloseButton ariaLabel="Close" handleClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveAccessibleName("Close");
  });

  it("calls the handleClick prop when clicked", async () => {
    const handleClick = jest.fn();
    render(<CloseButton ariaLabel="Close" handleClick={handleClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("sets additional classes on the button using the buttonClasses prop", async () => {
    render(
      <CloseButton
        buttonClasses="margin-right-1 font-sans-lg"
        ariaLabel="Close"
        handleClick={() => {}}
      />
    );
    expect(screen.getByRole("button")).toHaveClass("margin-right-1");
    expect(screen.getByRole("button")).toHaveClass("font-sans-lg");
  });
});
