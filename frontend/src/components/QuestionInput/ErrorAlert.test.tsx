import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { Alert } from "../../utils/alertUtils";

import { ErrorAlert } from "./ErrorAlert";
expect.extend(toHaveNoViolations);

describe("Test the ErrorAlert component", () => {
  it("correctly renders an error alert", async () => {
    const alert: Alert = {
      message: "alert message!",
      id: "alertId",
    };
    const { container } = render(<ErrorAlert onClose={() => {}} alert={alert} />);

    const errorAlert = screen.getByTestId(`errorAlert-${alert.id}`);
    expect(errorAlert).toBeInTheDocument();

    const alertText = within(errorAlert).getByText(alert.message);
    expect(alertText).toBeInTheDocument();

    const alertCloseButton = within(errorAlert).getByRole("button");
    expect(alertCloseButton).toBeInTheDocument();

    expect(alertCloseButton).toHaveAttribute("aria-label", "Close error alert");

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test the onClose function", () => {
  it("calls the onClose function with the file upload preview ID when the close button is clicked", async () => {
    const mockOnClose = jest.fn();
    const alert: Alert = {
      message: "alert message!",
      id: "alertId",
    };

    const { container } = render(<ErrorAlert onClose={mockOnClose} alert={alert} />);

    const errorAlert = screen.getByTestId(`errorAlert-${alert.id}`);
    expect(errorAlert).toBeInTheDocument();

    const alertCloseButton = within(errorAlert).getByRole("button");
    expect(alertCloseButton).toBeInTheDocument();

    await userEvent.click(alertCloseButton);

    expect(mockOnClose).toHaveBeenCalledWith(alert.id);

    expect(await axe(container)).toHaveNoViolations();
  });
});
