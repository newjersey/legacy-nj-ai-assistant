import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import type { Alert } from "../../utils/alertUtils";

import { ErrorAlert } from "./ErrorAlert";
expect.extend(toHaveNoViolations);

describe("Test the ErrorAlert component", () => {
  it("correctly renders an error alert", async () => {
    const alert: Alert = {
      message: "alert message!",
      id: "alertId",
    };
    const { container } = render(<ErrorAlert onRemove={jest.fn()} alert={alert} />);

    const errorAlert = screen.getByTestId(`errorAlert-${alert.id}`);
    expect(errorAlert).toBeInTheDocument();

    expect(errorAlert).toHaveAttribute("role", "alert");

    const alertText = within(errorAlert).getByText(alert.message);
    expect(alertText).toBeInTheDocument();

    const alertCloseButton = within(errorAlert).getByRole("button");
    expect(alertCloseButton).toBeInTheDocument();

    expect(alertCloseButton).toHaveAttribute("aria-label", `Close error alert: ${alert.message}`);

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test the onRemove function", () => {
  afterEach(jest.clearAllMocks);

  it("calls the onRemove function with the file upload preview ID when the close button is clicked", async () => {
    const mockOnRemove = jest.fn();
    const alert: Alert = {
      message: "alert message!",
      id: "alertId",
    };

    const { container } = render(<ErrorAlert onRemove={mockOnRemove} alert={alert} />);

    const errorAlert = screen.getByTestId(`errorAlert-${alert.id}`);
    expect(errorAlert).toBeInTheDocument();

    const alertCloseButton = within(errorAlert).getByRole("button");
    expect(alertCloseButton).toBeInTheDocument();

    await userEvent.click(alertCloseButton);

    expect(mockOnRemove).toHaveBeenCalledWith(alert.id);

    expect(await axe(container)).toHaveNoViolations();
  });
});
