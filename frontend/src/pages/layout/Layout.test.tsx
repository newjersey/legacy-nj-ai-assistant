import { HashRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";

import type { FrontendSettings, UI } from "../../api";
import type { AppState } from "../../state/AppProvider";
import { AppStateContext, initialState } from "../../state/AppProvider";

import Layout from "./Layout";

describe("<Layout>", () => {
  describe("conditionally renders the alert banner based on the AppState's alert_banner_message UI setting", () => {
    const FRONTEND_SETTINGS = {
      auth_enabled: "false",
      conversation_id_header: "",
      feedback_enabled: null,
      sanitize_answer: false,
      ui: {
        chat_description: "<p>Chat description</p>",
        chat_logo: "https://innovation.nj.gov/assets/images/nj-logo.svg",
        chat_title: "NJ AI Assistant",
        logo: "https://innovation.nj.gov/assets/images/nj-logo.svg",
        show_chat_history_button: true,
        show_share_button: false,
        title: "NJ AI Assistant",
      },
    } as const satisfies FrontendSettings;

    const renderLayoutComponentWithUISettings = (uiSettings: UI) => {
      const appState: AppState = {
        ...initialState,
        frontendSettings: {
          ...FRONTEND_SETTINGS,
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
        ...FRONTEND_SETTINGS.ui,
        alert_banner_message: alertMessage,
      });
      const alertBanner = screen.getByTestId("alert-banner");
      expect(alertBanner).toBeInTheDocument();
      expect(within(alertBanner).getByText(alertMessage)).toBeInTheDocument();
    });

    describe("does NOT render the alert banner when the alert_banner_message is", () => {
      it.each([
        ["null", null],
        ["an empty string", ""],
        ["a string with only whitespace", "  \t"],
      ])("%s", (_testCase, alertMessage) => {
        renderLayoutComponentWithUISettings({
          ...FRONTEND_SETTINGS.ui,
          alert_banner_message: alertMessage as string | undefined,
        });
        expect(screen.queryByTestId("alert-banner")).not.toBeInTheDocument();
      });

      it("undefined", () => {
        expect("alert_banner_message" in FRONTEND_SETTINGS.ui).toBe(false);
        renderLayoutComponentWithUISettings({ ...FRONTEND_SETTINGS.ui });
        expect(screen.queryByTestId("alert-banner")).not.toBeInTheDocument();
      });
    });
  });
});
