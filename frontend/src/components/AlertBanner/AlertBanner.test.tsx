import { render, screen, fireEvent } from "@testing-library/react";

import "@testing-library/jest-dom";

import { AlertBanner, AlertType } from "./AlertBanner";

const DEFAULT_ALERT_MESSAGE = "This is an alert!";
const DEFAULT_ALERT_ID = "test-alert";

const renderAlertBanner = (props: Partial<React.ComponentProps<typeof AlertBanner>> = {}) => {
  const defaultProps = {
    message: DEFAULT_ALERT_MESSAGE,
    alertType: AlertType.INFO,
    id: DEFAULT_ALERT_ID,
  };
  
  return render(<AlertBanner {...defaultProps} {...props} />);
};

const getAlertBanner = () => screen.getByTestId("alert-banner");
const queryAlertBanner = () => screen.queryByTestId("alert-banner");
const getCloseButton = () => screen.getByRole('button', { name: /close alert banner/i });
const queryCloseButton = () => screen.queryByRole('button', { name: /close alert banner/i });

describe("<AlertBanner>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const localStorageMock = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders the 'messageHtml' prop in a paragraph element with the 'usa-alert__text' class", () => {
    const alertMessage = "This is an alert!";
    renderAlertBanner({ message: alertMessage, alertType: AlertType.INFO, id: "test-alert-1" });
    const alertTextElement = screen.getByText(alertMessage);
    expect(alertTextElement).toBeInTheDocument();
    expect(alertTextElement).toHaveRole("paragraph");
    expect(alertTextElement).toHaveClass("usa-alert__text");
  });

  it("is styled to be a USWDS alert (slim, no icon)", () => {
    const expectedClasses = ["usa-alert", "usa-alert--slim", "usa-alert--no-icon"];
    renderAlertBanner({ message: "", alertType: AlertType.INFO, id: "test-alert-2" });
    const alertBanner = screen.getByTestId("alert-banner");
    for (const expectedClass of expectedClasses) {
      expect(alertBanner).toHaveClass(expectedClass);
    }
  });

  describe("sets the USWDS alert type based on the 'alertType' prop", () => {
    it.each(Object.values(AlertType))("alert type: %s", (alertType) => {
      renderAlertBanner({ message: "", alertType, id: `test-alert-${alertType}` });
      expect(screen.getByTestId("alert-banner")).toHaveClass(`usa-alert--${alertType}`);
    });
  });

  describe("dismissible functionality", () => {
    it("shows the CloseButton when dismissible prop is true", () => {
      renderAlertBanner({ dismissible: true });
      expect(getCloseButton()).toBeInTheDocument();
    });

    it("does not show the CloseButton when dismissible prop is false", () => {
      renderAlertBanner({ dismissible: false });
      expect(queryCloseButton()).not.toBeInTheDocument();
    });

    it("does not show the CloseButton when dismissible prop is undefined", () => {
      renderAlertBanner();
      expect(queryCloseButton()).not.toBeInTheDocument();
    });
  });

  describe("dismissal behavior", () => {
    it("hides the banner when CloseButton is clicked", () => {
      renderAlertBanner({ dismissible: true });
      
      expect(getAlertBanner()).toBeInTheDocument();
      
      fireEvent.click(getCloseButton());
      
      expect(queryAlertBanner()).not.toBeInTheDocument();
    });

    it("saves dismissal state to localStorage when closed", () => {
      renderAlertBanner({ dismissible: true, id: DEFAULT_ALERT_ID });
      
      fireEvent.click(getCloseButton());
      
      expect(localStorage.setItem).toHaveBeenCalledWith(`dismissed-alert-banner-${DEFAULT_ALERT_ID}`, 'true');
    });

    it("does not show banner if previously dismissed in localStorage", () => {
      localStorage.getItem = jest.fn(() => 'true');
      
      renderAlertBanner({ dismissible: true, id: DEFAULT_ALERT_ID });
      
      expect(queryAlertBanner()).not.toBeInTheDocument();
      expect(localStorage.getItem).toHaveBeenCalledWith(`dismissed-alert-banner-${DEFAULT_ALERT_ID}`);
    });

    it("renders a new banner with different id even if another banner was previously dismissed", () => {
      const dismissedBannerId = "dismissed-banner";
      const newBannerId = "new-banner";
      
      localStorage.getItem = jest.fn((key) => {
        if (key === `dismissed-alert-banner-${dismissedBannerId}`) {
          return 'true';
        }
        return null;
      });
      
      renderAlertBanner({ dismissible: true, id: newBannerId });
      
      expect(getAlertBanner()).toBeInTheDocument();
      expect(localStorage.getItem).toHaveBeenCalledWith(`dismissed-alert-banner-${newBannerId}`);
    });
  });
});
