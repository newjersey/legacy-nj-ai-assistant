import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { ErrorAlert } from "./ErrorAlert";
expect.extend(toHaveNoViolations);

describe("Test the ErrorAlert component", () => {
  it("correctly renders an error alert", async () => {
    const alertMessage = "alert message!";
    const alertType = "alert-type";

    const { container } = render(
      <ErrorAlert onRemove={jest.fn()} message={alertMessage} alertType={alertType} />
    );

    const errorAlert = screen.getByTestId(alertType);
    expect(errorAlert).toBeInTheDocument();

    const alertText = within(errorAlert).getByText(alertMessage);
    expect(alertText).toBeInTheDocument();
    expect(alertText).toHaveRole("alert");

    const alertCloseButton = within(errorAlert).getByRole("button");
    expect(alertCloseButton).toBeInTheDocument();

    expect(alertCloseButton).toHaveAccessibleName(
      `Close error alert: ${alertType.replaceAll("-", " ")}`
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test the onRemove function", () => {
  afterEach(jest.clearAllMocks);

  it("calls the onRemove function with the alertType when the close button is clicked", async () => {
    const mockOnRemove = jest.fn();
    const alertMessage = "alert message!";
    const alertType = "alert-type";

    const { container } = render(
      <ErrorAlert onRemove={mockOnRemove} message={alertMessage} alertType={alertType} />
    );

    const errorAlert = screen.getByTestId(alertType);
    expect(errorAlert).toBeInTheDocument();

    const alertCloseButton = within(errorAlert).getByRole("button");
    expect(alertCloseButton).toBeInTheDocument();

    await userEvent.click(alertCloseButton);

    expect(mockOnRemove).toHaveBeenCalledWith(alertType);

    expect(await axe(container)).toHaveNoViolations();
  });
});
