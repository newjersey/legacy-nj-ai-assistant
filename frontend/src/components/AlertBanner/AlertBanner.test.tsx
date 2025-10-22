import { render, screen, fireEvent } from "@testing-library/react";

import "@testing-library/jest-dom";

import { AlertBanner, AlertType } from "./AlertBanner";

describe("<AlertBanner>", () => {
  it("renders the 'messageHtml' prop in a paragraph element with the 'usa-alert__text' class", () => {
    const alertMessage = "This is an alert!";
    render(<AlertBanner message={alertMessage} alertType={AlertType.INFO} id="test-alert-1" />);
    const alertTextElement = screen.getByText(alertMessage);
    expect(alertTextElement).toBeInTheDocument();
    expect(alertTextElement).toHaveRole("paragraph");
    expect(alertTextElement).toHaveClass("usa-alert__text");
  });

  it("is styled to be a USWDS alert (slim, no icon)", () => {
    const expectedClasses = ["usa-alert", "usa-alert--slim", "usa-alert--no-icon"];
    render(<AlertBanner message="" alertType={AlertType.INFO} id="test-alert-2" />);
    const alertBanner = screen.getByTestId("alert-banner");
    for (const expectedClass of expectedClasses) {
      expect(alertBanner).toHaveClass(expectedClass);
    }
  });

  describe("sets the USWDS alert type based on the 'alertType' prop", () => {
    it.each(Object.values(AlertType))("alert type: %s", (alertType) => {
      render(<AlertBanner message="" alertType={alertType} id={`test-alert-${alertType}`} />);
      expect(screen.getByTestId("alert-banner")).toHaveClass(`usa-alert--${alertType}`);
    });
  });

  describe("CloseButton functionality", () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    });

    it("shows the CloseButton when dismissible prop is true", () => {
      render(<AlertBanner message="Test Alert" alertType={AlertType.INFO} dismissible={true} id="test-alert" />);
      
      const closeButton = screen.getByRole('button', { name: /close alert banner/i });
      expect(closeButton).toBeInTheDocument();
    });

    it("does not show the CloseButton when dismissible prop is false", () => {
      render(<AlertBanner message="Test Alert" alertType={AlertType.INFO} dismissible={false} id="test-alert" />);
      
      const closeButton = screen.queryByRole('button', { name: /close alert banner/i });
      expect(closeButton).not.toBeInTheDocument();
    });

    it("does not show the CloseButton when dismissible prop is undefined", () => {
      render(<AlertBanner message="Test Alert" alertType={AlertType.INFO} id="test-alert" />);
      
      const closeButton = screen.queryByRole('button', { name: /close alert banner/i });
      expect(closeButton).not.toBeInTheDocument();
    });

    it("hides the banner when CloseButton is clicked", () => {
      render(<AlertBanner message="Test Alert" alertType={AlertType.INFO} dismissible={true} id="test-alert" />);
      
      const banner = screen.getByTestId("alert-banner");
      expect(banner).toBeInTheDocument();
      
      const closeButton = screen.getByRole('button', { name: /close alert banner/i });
      fireEvent.click(closeButton);
      
      expect(screen.queryByTestId("alert-banner")).not.toBeInTheDocument();
    });

    it("saves dismissal state to localStorage when closed", () => {
      render(<AlertBanner message="Test Alert" alertType={AlertType.INFO} dismissible={true} id="test-alert" />);
      
      const closeButton = screen.getByRole('button', { name: /close alert banner/i });
      fireEvent.click(closeButton);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('dismissed-alert-test-alert', 'true');
    });

    it("doesn't show banner if previously dismissed in localStorage", () => {
      // Setup localStorage mock to simulate previously dismissed alert
      localStorage.getItem = jest.fn(() => 'true');
      
      render(<AlertBanner message="Test Alert" alertType={AlertType.INFO} dismissible={true} id="test-alert" />);
      
      expect(screen.queryByTestId("alert-banner")).not.toBeInTheDocument();
      expect(localStorage.getItem).toHaveBeenCalledWith('dismissed-alert-test-alert');
    });
  });
});
