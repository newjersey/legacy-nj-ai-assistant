import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { Alert } from "../../utils/alertUtils";

import { AlertBanner } from "./AlertBanner";
expect.extend(toHaveNoViolations);

describe("Test the AlertBanner component", () => {
  it("correctly renders an alert banner", async () => {
    const alert: Alert = {
      message: "alert message!",
      id: "alertId",
    };
    const { container } = render(<AlertBanner onClose={() => {}} alert={alert} />);

    const alertBanner = screen.getByTestId(`errorAlert-${alert.id}`);
    expect(alertBanner).toBeInTheDocument();

    const alertText = within(alertBanner).getByText(alert.message);
    expect(alertText).toBeInTheDocument();

    const alertCloseButton = within(alertBanner).getByRole("button");
    expect(alertCloseButton).toBeInTheDocument();

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

    const { container } = render(<AlertBanner onClose={mockOnClose} alert={alert} />);

    const alertBanner = screen.getByTestId(`errorAlert-${alert.id}`);
    expect(alertBanner).toBeInTheDocument();

    const alertCloseButton = within(alertBanner).getByRole("button");
    expect(alertCloseButton).toBeInTheDocument();

    userEvent.click(alertCloseButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith(alert.id);
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
