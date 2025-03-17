import { HashRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";

import type { FrontendSettings, UI } from "../../api";
import { AlertType } from "../../components/AlertBanner/AlertBanner";
import type { AppState } from "../../state/AppProvider";
import { AppStateContext, initialState } from "../../state/AppProvider";

import Layout from "./Layout";

describe("<Layout>", () => {
  describe("alert banner", () => {
    const DEFAULT_UI: FrontendSettings["ui"] = {
      title: "NJ AI Assistant",
      chat_title: "NJ AI Assistant",
      chat_description: "<p>Chat description</p>",
    };

    const renderLayoutComponentWithUISettings = (uiSettings: UI) => {
      const appState: AppState = {
        ...initialState,
        frontendSettings: {
          ...initialState.frontendSettings,
          ui: uiSettings,
        },
      };
      render(
        <AppStateContext.Provider
          value={{
            state: appState,
            dispatch: () => {},
          }}
        >
          <Layout />
        </AppStateContext.Provider>,
        { wrapper: HashRouter }
      );
    };

    describe("conditionally renders the alert banner based on the AppState's alert_banner_message UI setting", () => {
      it("renders the alert banner when the alert_banner_message is a non-empty string", () => {
        const alertMessage = "Alert!";
        renderLayoutComponentWithUISettings({
          ...DEFAULT_UI,
          alert_banner_message: alertMessage,
        });
        const alertBanner = screen.getByTestId("alert-banner");
        expect(alertBanner).toBeInTheDocument();
        expect(within(alertBanner).getByText(alertMessage)).toBeInTheDocument();
      });

      it.each([
        ["null", null],
        ["an empty string", ""],
        ["a string with only whitespace", "  \t"],
      ])(
        "does NOT render the alert banner when the alert_banner_message is %s",
        (_testCase, alertMessage) => {
          renderLayoutComponentWithUISettings({
            ...DEFAULT_UI,
            alert_banner_type: alertMessage as string | undefined,
          });
          expect(screen.queryByTestId("alert-banner")).not.toBeInTheDocument();
        }
      );

      it("does NOT render the alert banner when the alert_banner_message is undefined", () => {
        expect(DEFAULT_UI?.alert_banner_message).toBe(undefined);
        renderLayoutComponentWithUISettings(DEFAULT_UI);
        expect(screen.queryByTestId("alert-banner")).not.toBeInTheDocument();
      });
    });

    describe("renders the alert banner with a given USWDS alert type based the AppState's alert_banner_type UI setting", () => {
      describe("renders an alert banner with the corresponding alert type when alert_banner_type is a valid type", () => {
        it.each(Object.values(AlertType))("%s type", (alertType) => {
          renderLayoutComponentWithUISettings({
            ...DEFAULT_UI,
            alert_banner_message: "This is an alert!",
            alert_banner_type: alertType,
          });
          const alertBanner = screen.getByTestId("alert-banner");
          expect(alertBanner).toBeInTheDocument();
          expect(alertBanner).toHaveClass(`usa-alert--${alertType}`);
        });

        it("renders the given alert type when alert_banner_type has uppercase letters but is a valid type otherwise", () => {
          renderLayoutComponentWithUISettings({
            ...DEFAULT_UI,
            alert_banner_message: "This is an alert!",
            alert_banner_type: "EmergencY",
          });
          const alertBanner = screen.getByTestId("alert-banner");
          expect(alertBanner).toBeInTheDocument();
          expect(alertBanner).toHaveClass("usa-alert--emergency");
        });
      });

      it.each(Object.values(AlertType))(
        "renders an alert banner with the corresponding alert type when alert_banner_type is valid",
        (alertType) => {
          renderLayoutComponentWithUISettings({
            ...DEFAULT_UI,
            alert_banner_message: "This is an alert!",
            alert_banner_type: alertType,
          });
          const alertBanner = screen.getByTestId("alert-banner");
          expect(alertBanner).toBeInTheDocument();
          expect(alertBanner).toHaveClass(`usa-alert--${alertType}`);
        }
      );

      it("renders an info alert type by default when alert_banner_type is undefined", () => {
        expect(DEFAULT_UI?.alert_banner_type).toBe(undefined);
        renderLayoutComponentWithUISettings({
          ...DEFAULT_UI,
          alert_banner_message: "This is an alert!",
        });
        const alertBanner = screen.getByTestId("alert-banner");
        expect(alertBanner).toBeInTheDocument();
        expect(alertBanner).toHaveClass("usa-alert--info");
      });

      it.each([
        ["null", null],
        ["an empty string", ""],
        ["a string with only whitespace", "  \t"],
        ["an invalid alert type", "happy"],
      ])(
        "renders an info alert type by default when alert_banner_type is %s",
        (_testCase, alertType) => {
          renderLayoutComponentWithUISettings({
            ...DEFAULT_UI,
            alert_banner_message: "This is an alert!",
            alert_banner_type: alertType as string | undefined,
          });
          const alertBanner = screen.getByTestId("alert-banner");
          expect(alertBanner).toBeInTheDocument();
          expect(alertBanner).toHaveClass("usa-alert--info");
        }
      );
    });
  });
});
