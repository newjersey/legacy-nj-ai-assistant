import { render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import type { AlertsMap } from "../../utils/alertUtils";
import { defaultAlertsMap, AlertTypes } from "../../utils/alertUtils";

import { ErrorAlertContainer } from "./ErrorAlertContainer";
expect.extend(toHaveNoViolations);

describe("Test the AlertContainer component", () => {
  it("correctly renders an alert container containing one error alert", async () => {
    const mockAlerts: AlertsMap = {
      [AlertTypes.IMAGE_EXCEEDS_MAX_SIZE]: "alert message",
    };

    const { container } = render(<ErrorAlertContainer onRemove={jest.fn()} alerts={mockAlerts} />);

    Object.entries(mockAlerts).forEach(([alertType, alertMessage]) => {
      const errorAlert = screen.getByTestId(`${alertType}`);
      expect(errorAlert).toBeInTheDocument();

      const alertText = within(errorAlert).getByText(alertMessage!);
      expect(alertText).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("correctly renders an alert container containing multiple error alerts", async () => {
    const mockAlerts: AlertsMap = {
      [AlertTypes.IMAGE_EXCEEDS_MAX_SIZE]: "alert message 1",
      [AlertTypes.FILE_EXCEEDS_MAX_SIZE]: "alert message 2",
      [AlertTypes.PROMPT_NOT_ENTERED]: "alert message 3",
    };

    const { container } = render(<ErrorAlertContainer onRemove={jest.fn()} alerts={mockAlerts} />);

    Object.entries(mockAlerts).forEach(([alertType, alertMessage]) => {
      const errorAlert = screen.getByTestId(`${alertType}`);
      expect(errorAlert).toBeInTheDocument();

      const alertText = within(errorAlert).getByText(alertMessage!);
      expect(alertText).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
