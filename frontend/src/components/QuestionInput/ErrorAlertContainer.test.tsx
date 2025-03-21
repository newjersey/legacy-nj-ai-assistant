import { render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import type { AlertsMap } from "../../utils/alertUtils";
import { ErrorAlertType } from "../../utils/alertUtils";

import { ErrorAlertContainer } from "./ErrorAlertContainer";
expect.extend(toHaveNoViolations);

describe("Test the ErrorAlertContainer component", () => {
  it("correctly renders an alert container containing no alerts", async () => {
    const mockAlerts: AlertsMap = {};

    const { container } = render(<ErrorAlertContainer onRemove={jest.fn()} alerts={mockAlerts} />);

    const errorAlertContainer = screen.getByTestId("error-alert-container");
    expect(errorAlertContainer).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("correctly renders an alert container containing no alerts when all alert messages are null", async () => {
    const mockAlerts: AlertsMap = {
      [ErrorAlertType.IMAGE_EXCEEDS_MAX_SIZE]: null,
    };

    const { container } = render(<ErrorAlertContainer onRemove={jest.fn()} alerts={mockAlerts} />);

    const errorAlertContainer = screen.getByTestId("error-alert-container");
    expect(errorAlertContainer).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("correctly renders an alert container containing one error alert", async () => {
    const alertType = ErrorAlertType.IMAGE_EXCEEDS_MAX_SIZE;
    const alertMessage = "message";
    const mockAlerts: AlertsMap = {
      [alertType]: "alert message",
    };

    const { container } = render(<ErrorAlertContainer onRemove={jest.fn()} alerts={mockAlerts} />);

    const errorAlert = screen.getByTestId(alertType);
    expect(errorAlert).toBeInTheDocument();

    const alertText = within(errorAlert).getByText(alertMessage!);
    expect(alertText).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("correctly renders an alert container containing multiple error alerts", async () => {
    const mockAlerts: AlertsMap = {
      [ErrorAlertType.IMAGE_EXCEEDS_MAX_SIZE]: "alert message 1",
      [ErrorAlertType.FILE_EXCEEDS_MAX_SIZE]: "alert message 2",
      [ErrorAlertType.PROMPT_NOT_ENTERED]: "alert message 3",
    };

    const { container } = render(<ErrorAlertContainer onRemove={jest.fn()} alerts={mockAlerts} />);

    Object.entries(mockAlerts).forEach(([alertType, alertMessage]) => {
      const errorAlert = screen.getByTestId(alertType);
      expect(errorAlert).toBeInTheDocument();

      const alertText = within(errorAlert).getByText(alertMessage!);
      expect(alertText).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
