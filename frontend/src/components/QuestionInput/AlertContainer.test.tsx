import { render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import type { Alert } from "../../utils/alertUtils";

import { AlertContainer } from "./AlertContainer";
expect.extend(toHaveNoViolations);

const createMockAlerts = (number: number): Alert[] => {
  const alerts: Alert[] = [];

  for (let i = 0; i < number; i++) {
    alerts.push({
      message: `alert-${i}`,
      id: `alertId-${i}`,
    });
  }

  return alerts;
};

describe("Test the AlertContainer component", () => {
  it("correctly renders an alert container containing one error alert", async () => {
    const mockAlerts = createMockAlerts(1);
    const { container } = render(<AlertContainer onRemove={jest.fn()} alerts={mockAlerts} />);

    const errorAlert = screen.getByTestId(`errorAlert-${mockAlerts[0].id}`);
    expect(errorAlert).toBeInTheDocument();

    const alertText = within(errorAlert).getByText(mockAlerts[0].message);
    expect(alertText).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("correctly renders an alert container containing multiple error alerts", async () => {
    const mockAlerts = createMockAlerts(3);

    const { container } = render(<AlertContainer onRemove={jest.fn()} alerts={mockAlerts} />);

    mockAlerts.forEach((alert) => {
      const errorAlert = screen.getByTestId(`errorAlert-${alert.id}`);
      expect(errorAlert).toBeInTheDocument();

      const alertText = within(errorAlert).getByText(alert.message);
      expect(alertText).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
