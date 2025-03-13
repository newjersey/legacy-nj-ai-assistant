import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { ALERT_TYPES, AlertBanner } from "./AlertBanner";

describe("<AlertBanner>", () => {
  it("renders the 'messageHtml' prop in a paragraph element with the 'usa-alert__text' class", () => {
    const alertMessage = "This is an alert!";
    render(<AlertBanner message={alertMessage} />);
    const alertTextElement = screen.getByText(alertMessage);
    expect(alertTextElement).toBeInTheDocument();
    expect(alertTextElement).toHaveRole("paragraph");
    expect(alertTextElement).toHaveClass("usa-alert__text");
  });

  it("is styled to be a USWDS alert (slim, no icon)", () => {
    const expectedClasses = ["usa-alert", "usa-alert--slim", "usa-alert--no-icon"];
    render(<AlertBanner message="" />);
    const alertBanner = screen.getByTestId("alert-banner");
    for (const expectedClass of expectedClasses) {
      expect(alertBanner).toHaveClass(expectedClass);
    }
  });

  describe("alertType prop", () => {
    it("renders the USWDS info alert type by default when the 'alertType' prop is missing", () => {
      render(<AlertBanner message="" />);
      expect(screen.getByTestId("alert-banner")).toHaveClass(`usa-alert--info`);
    });

    describe("sets the USWDS alert type based on the 'alertType' prop when it is defined", () => {
      it.each(ALERT_TYPES)("alert type: %s", (alertType) => {
        render(<AlertBanner message="" alertType={alertType} />);
        expect(screen.getByTestId("alert-banner")).toHaveClass(`usa-alert--${alertType}`);
      });
    });
  });
});
