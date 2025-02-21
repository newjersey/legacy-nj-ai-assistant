import { render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { Alert } from "../../utils/alertUtils";

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
  it("correctly renders an alert container containing one alert banner", async () => {
    const mockAlerts = createMockAlerts(1);
    const { container } = render(<AlertContainer onClose={() => {}} alerts={mockAlerts} />);

    const alertBanner = screen.getByTestId(`errorAlert-${mockAlerts[0].id}`);
    expect(alertBanner).toBeInTheDocument();

    const alertText = within(alertBanner).getByText(mockAlerts[0].message);
    expect(alertText).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("correctly renders an alert container containing multiple alert banners", async () => {
    const mockAlerts = createMockAlerts(3);

    const { container } = render(<AlertContainer onClose={() => {}} alerts={mockAlerts} />);

    mockAlerts.forEach((alert) => {
      const alertBanner = screen.getByTestId(`errorAlert-${alert.id}`);
      expect(alertBanner).toBeInTheDocument();

      const alertText = within(alertBanner).getByText(alert.message);
      expect(alertText).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
