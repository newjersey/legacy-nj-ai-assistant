import { HashRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";

import type { FrontendSettings, UI } from "../../api";
import type { AppState } from "../../state/AppProvider";
import { AppStateContext, initialState } from "../../state/AppProvider";

import Layout from "./Layout";

describe("<Layout>", () => {
  describe("conditionally renders the alert banner based on the AppState's alert_banner_message UI setting", () => {
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
          alert_banner_message: alertMessage as string | undefined,
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
});
