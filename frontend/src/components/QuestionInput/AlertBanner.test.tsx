import { render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { Alert } from "../../custom/alertUtils";

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
