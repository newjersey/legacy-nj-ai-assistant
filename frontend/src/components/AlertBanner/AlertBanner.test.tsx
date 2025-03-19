import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { AlertBanner, AlertType } from "./AlertBanner";

describe("<AlertBanner>", () => {
  it("renders the 'messageHtml' prop in a paragraph element with the 'usa-alert__text' class", () => {
    const alertMessage = "This is an alert!";
    render(<AlertBanner message={alertMessage} alertType={AlertType.INFO} />);
    const alertTextElement = screen.getByText(alertMessage);
    expect(alertTextElement).toBeInTheDocument();
    expect(alertTextElement).toHaveRole("paragraph");
    expect(alertTextElement).toHaveClass("usa-alert__text");
  });

  it("is styled to be a USWDS alert (slim, no icon)", () => {
    const expectedClasses = ["usa-alert", "usa-alert--slim", "usa-alert--no-icon"];
    render(<AlertBanner message="" alertType={AlertType.INFO} />);
    const alertBanner = screen.getByTestId("alert-banner");
    for (const expectedClass of expectedClasses) {
      expect(alertBanner).toHaveClass(expectedClass);
    }
  });

  describe("sets the USWDS alert type based on the 'alertType' prop", () => {
    it.each(Object.values(AlertType))("alert type: %s", (alertType) => {
      render(<AlertBanner message="" alertType={alertType} />);
      expect(screen.getByTestId("alert-banner")).toHaveClass(`usa-alert--${alertType}`);
    });
  });
});
