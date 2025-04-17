import { useRef } from "react";
import { HashRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FrontendSettings } from "../../api";
import type { AppState } from "../../state/AppProvider";
import { AppStateContext, initialState } from "../../state/AppProvider";
import {
  DISABLE_COACH_MARKS_FOR_TEST_STORAGE_KEY,
  getHideCoachMarkStorageKey,
} from "../../utils/coachMarkUtils";
import * as logEvent from "../../utils/logEvent";

import * as CoachMark from "./CoachMark";

const DEFAULT_EXPIRATION_DATE = "2025-01-01";
const DEFAULT_COACH_MARK_OPTIONS: Omit<CoachMark.CoachMarkOptions, "referenceRef"> = {
  id: "",
  coachMarkPortal: (
    <CoachMark.Portal allowedPlacements={["top"]}>
      <></>
    </CoachMark.Portal>
  ),
};

const defaultCoachMarkHeading = "Multiple file upload";
const defaultCoachMarkDescription = "You can now upload multiple files.";

interface ComponentWithCoachMarkProps {
  useCoachMarkOptions: Omit<CoachMark.CoachMarkOptions, "referenceRef">;
}

const ComponentWithCoachMark = (props: ComponentWithCoachMarkProps) => {
  const coachMarkReferenceRef = useRef(null);
  const coachMark = CoachMark.useCoachMark({
    ...props.useCoachMarkOptions,
    referenceRef: coachMarkReferenceRef,
  });

  return (
    <CoachMark.Root coachMark={coachMark}>
      <p ref={coachMarkReferenceRef} {...coachMark.getReferenceProps()}>
        Reference element
      </p>
      <p>Outside element</p>
    </CoachMark.Root>
  );
};

const renderTestCoachMark = (options: {
  useCoachMarkOptions: Omit<CoachMark.CoachMarkOptions, "referenceRef">;
  coach_mark_expiration_date_iso?: string;
}) => {
  const uiSettings: FrontendSettings["ui"] = {
    title: "NJ AI Assistant",
    chat_title: "NJ AI Assistant",
    chat_description: "<p>Chat description</p>",
    ...(options.coach_mark_expiration_date_iso !== undefined && {
      coach_mark_expiration_date_iso: options.coach_mark_expiration_date_iso,
    }),
  };

  const appState: AppState = {
    ...initialState,
    frontendSettings: {
      ...initialState.frontendSettings,
      ui: uiSettings,
    },
  };

  return render(
    <AppStateContext.Provider
      value={{
        state: appState,
        dispatch: () => {},
      }}
    >
      <ComponentWithCoachMark useCoachMarkOptions={options.useCoachMarkOptions} />
    </AppStateContext.Provider>,
    { wrapper: HashRouter }
  );
};

const getReferenceElement = (): HTMLElement => screen.getByText("Reference element");

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ advanceTimers: true });
  const oneDayBeforeExpiration = new Date(DEFAULT_EXPIRATION_DATE).getTime() - 24 * 60 * 60 * 1000;
  jest.setSystemTime(oneDayBeforeExpiration);
});

afterEach(() => {
  localStorage.clear();
  jest.useRealTimers();
});

describe(CoachMark.useCoachMark.name, () => {
  it("removes the hideCoachMark storage item if the coach mark is expired", () => {
    const coachMarkId = "multiple-file-upload";
    const expirationDate = "2025-01-02";
    jest.setSystemTime(new Date("2025-01-03"));

    const hideCoachMarkKey = getHideCoachMarkStorageKey(coachMarkId);
    localStorage.setItem(hideCoachMarkKey, JSON.stringify(true));

    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        id: coachMarkId,
      },
      coach_mark_expiration_date_iso: expirationDate,
    });
    expect(localStorage.getItem(hideCoachMarkKey)).toBeNull();
  });

  describe("conditional logic for showing coach mark", () => {
    it.each([
      ["a valid ISO date", "2025-02-02"],
      ["a valid ISO date with whitespace", " 2025-02-02"],
    ])(
      "shows the coach mark if the expiration has not passed (coach_mark_expiration_date_iso is %s)",
      (_testcase, expirationDate) => {
        jest.setSystemTime(new Date("2025-01-01"));

        const coachMarkHeading = "Multiple file upload";

        renderTestCoachMark({
          useCoachMarkOptions: {
            ...DEFAULT_COACH_MARK_OPTIONS,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              </CoachMark.Portal>
            ),
          },
          coach_mark_expiration_date_iso: expirationDate,
        });

        expect(screen.queryByRole("dialog", { name: coachMarkHeading })).toBeInTheDocument();
      }
    );

    it("does not show the coach mark if its expiration date has passed", () => {
      const expirationDate = "2025-01-02";
      jest.setSystemTime(new Date("2025-01-03"));

      const coachMarkHeading = "Multiple file upload";

      renderTestCoachMark({
        useCoachMarkOptions: {
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
            </CoachMark.Portal>
          ),
        },
        coach_mark_expiration_date_iso: expirationDate,
      });

      expect(screen.queryByRole("dialog", { name: coachMarkHeading })).not.toBeInTheDocument();
    });

    it("does not show the coach mark if it has already been dismissed (localStorage has hideCoachMark key)", () => {
      const coachMarkId = "multiple-file-upload";

      jest.setSystemTime(new Date("2025-01-01"));
      const expirationDate = "2025-01-02";

      const hideCoachMarkKey = getHideCoachMarkStorageKey(coachMarkId);
      localStorage.setItem(hideCoachMarkKey, "true");

      const coachMarkHeading = "Multiple file upload";

      renderTestCoachMark({
        useCoachMarkOptions: {
          ...DEFAULT_COACH_MARK_OPTIONS,
          id: coachMarkId,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
            </CoachMark.Portal>
          ),
        },
        coach_mark_expiration_date_iso: expirationDate,
      });

      expect(screen.queryByRole("dialog", { name: coachMarkHeading })).not.toBeInTheDocument();
    });

    it.each([
      ["undefined", undefined],
      ["null", null],
      ["an empty string", ""],
      ["incorrectly formatted", "2026--01--01"],
    ])(
      "does not show the coach mark if the coach_mark_expiration_date_iso is %s",
      (_testCase, coach_mark_expiration_date_iso) => {
        const coachMarkId = "multiple-file-upload";

        jest.setSystemTime(new Date("2025-01-01"));

        const coachMarkHeading = "Multiple file upload";

        renderTestCoachMark({
          useCoachMarkOptions: {
            ...DEFAULT_COACH_MARK_OPTIONS,
            id: coachMarkId,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              </CoachMark.Portal>
            ),
          },
          coach_mark_expiration_date_iso: coach_mark_expiration_date_iso as unknown as string,
        });

        expect(screen.queryByRole("dialog", { name: coachMarkHeading })).not.toBeInTheDocument();
      }
    );

    it("does not show if the coach mark if the disableCoachMarksForTests localStorage item is set", () => {
      const coachMarkId = "multiple-file-upload";

      jest.setSystemTime(new Date("2025-01-01"));
      const expirationDate = "2025-01-02";

      localStorage.setItem(DISABLE_COACH_MARKS_FOR_TEST_STORAGE_KEY, "true");

      const coachMarkHeading = "Multiple file upload";

      renderTestCoachMark({
        useCoachMarkOptions: {
          ...DEFAULT_COACH_MARK_OPTIONS,
          id: coachMarkId,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
            </CoachMark.Portal>
          ),
        },
        coach_mark_expiration_date_iso: expirationDate,
      });

      expect(screen.queryByRole("dialog", { name: coachMarkHeading })).not.toBeInTheDocument();
    });
  });

  const clickDoneButton = async () => {
    const button = screen.getByRole("button", { name: "Done" });
    await userEvent.click(button);
  };

  const clickCloseButton = async () => {
    const button = screen.getByRole("button", { name: "Close" });
    await userEvent.click(button);
  };

  const pressEscapeKey = async () => await userEvent.keyboard("{Escape}");

  const clickReferenceElement = async () => {
    await userEvent.click(getReferenceElement());
  };

  describe.each([
    ["the done button is clicked", clickDoneButton],
    ["the close button is clicked", clickCloseButton],
    ["the Escape key is pressed", pressEscapeKey],
    ["the reference element is clicked", clickReferenceElement],
  ])(
    "dismissing the coach mark (tests the effects of the handleDismiss handler returned by useCoachMark)",
    (testCase, dismissEvent) => {
      it(`closes the dialog when ${testCase}`, async () => {
        renderTestCoachMark({
          useCoachMarkOptions: {
            ...DEFAULT_COACH_MARK_OPTIONS,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
              </CoachMark.Portal>
            ),
          },
          coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
        });

        expect(screen.getByText(defaultCoachMarkHeading)).toBeInTheDocument();
        await dismissEvent();
        expect(screen.queryByText(defaultCoachMarkHeading)).not.toBeInTheDocument();
      });

      it(`sets the hideCoachMark localStorage item and fires the 'click_close_coach_mark' GA event when ${testCase}`, async () => {
        const logEventSpy = jest.spyOn(logEvent, "logEvent");

        const coachMarkId = "multiple_file_upload";
        renderTestCoachMark({
          useCoachMarkOptions: {
            ...DEFAULT_COACH_MARK_OPTIONS,
            id: coachMarkId,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
              </CoachMark.Portal>
            ),
          },
          coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
        });

        const hideCoachMarkKey = getHideCoachMarkStorageKey(coachMarkId);
        expect(localStorage.getItem(hideCoachMarkKey)).toBeNull();

        expect(screen.getByText(defaultCoachMarkHeading)).toBeInTheDocument();
        await dismissEvent();
        expect(screen.queryByText(defaultCoachMarkHeading)).not.toBeInTheDocument();

        expect(localStorage.getItem(hideCoachMarkKey)).toBe("true");
        expect(logEventSpy).toHaveBeenCalledWith("coach_mark_single_feat_dimiss", {
          coach_mark_id: coachMarkId,
        });
        expect(logEventSpy).toHaveBeenCalledTimes(1);
      });

      it(`removes the coachMarkActive class when ${testCase}`, async () => {
        renderTestCoachMark({
          useCoachMarkOptions: {
            ...DEFAULT_COACH_MARK_OPTIONS,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
              </CoachMark.Portal>
            ),
          },
          coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
        });

        await dismissEvent();
        expect(getReferenceElement()).not.toHaveClass("coachMarkActive");
      });
    }
  );
});

describe(CoachMark.Root.name, () => {
  it("renders the component's children elements", () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <></>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    expect(getReferenceElement()).toBeInTheDocument();
  });

  it("throws an error when the 'coachMarkPortal' option is not a coachMarkPortal component", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderTestCoachMark({
        useCoachMarkOptions: {
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: <p>I'm not a CoachMarkPortal</p>,
        },
        coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
      })
    ).toThrow();
    error.mockReset();
  });

  it("does not dismiss the coach mark when pressing outside of both the coach mark and reference elements", async () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    expect(screen.getByText(defaultCoachMarkHeading)).toBeInTheDocument();

    const outsideElement = screen.getByText("Outside element");
    await userEvent.click(outsideElement);

    expect(screen.getByText(defaultCoachMarkHeading)).toBeInTheDocument();
  });

  it("renders an empty element with data-testid='coach-mark'", () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <></>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    expect(screen.getByTestId("coach-mark")).toBeInTheDocument();
    expect(screen.getByTestId("coach-mark")).toBeEmptyDOMElement();
  });
});

describe(CoachMark.Portal.name, () => {
  it("renders its children on load (is open by default)", () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
            <CoachMark.Description>
              <p>{defaultCoachMarkDescription}</p>
            </CoachMark.Description>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    expect(screen.getByText(defaultCoachMarkHeading)).toBeInTheDocument();
    expect(screen.getByText(defaultCoachMarkDescription)).toBeInTheDocument();
  });

  it(`renders a modal dialog whose accessible name and description are set by the ${CoachMark.Heading.name} and ${CoachMark.Description.name} components`, async () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
            <CoachMark.Description>
              <p>{defaultCoachMarkDescription}</p>
            </CoachMark.Description>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    const coachMark = screen.getByRole("dialog");
    expect(coachMark).toHaveAttribute("aria-modal", "true");
    expect(coachMark).toHaveAccessibleName(defaultCoachMarkHeading);
    expect(coachMark).toHaveAccessibleDescription(defaultCoachMarkDescription);
  });

  it(`does not set the dialog's accessible name/description when the ${CoachMark.Heading.name} and ${CoachMark.Description.name} components are absent`, async () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <></>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });
    const coachMark = screen.getByRole("dialog");
    expect(coachMark).not.toHaveAccessibleName();
    expect(coachMark).not.toHaveAccessibleDescription();
  });

  it("adds the coachMarkActive class to the reference element", () => {
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <></>
            </CoachMark.Portal>
          ),
        }}
      />
    );

    expect(getReferenceElement()).toHaveClass("coachMarkActive");
  });

  it("traps focus within dialog and has a logical focus order", async () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
            <a href="example.com">Links are focusable</a>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    const closeButton = screen.getByRole("button", { name: "Close" });
    const doneButton = screen.getByRole("button", { name: "Done" });
    const otherFocusableElementInDialog = screen.getByRole("link");

    await waitFor(() => expect(closeButton).toHaveFocus());

    await userEvent.keyboard("{Tab}");
    expect(otherFocusableElementInDialog).toHaveFocus();

    await userEvent.keyboard("{Tab}");
    expect(doneButton).toHaveFocus();

    await userEvent.keyboard("{Tab}");
    await waitFor(() => expect(closeButton).toHaveFocus());
  });
});

describe(CoachMark.Heading.name, () => {
  it("renders its children inside a heading level 1", () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    const heading = screen.getByRole("heading", { level: 1 });
    expect(within(heading).getByText(defaultCoachMarkHeading)).toBeInTheDocument();
  });

  it("serves as the dialog's accessible name (via the aria-labelledby attribute)", () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    const heading = screen.getByRole("heading", { level: 1 });
    const coachMark = screen.getByRole("dialog");
    expect(coachMark).toHaveAttribute("aria-labelledby", heading.id);
    expect(coachMark).toHaveAccessibleName(defaultCoachMarkHeading);
  });
});

describe(CoachMark.Description.name, () => {
  it("renders the component's children elements", () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Description>
              <ol>
                <li>{defaultCoachMarkDescription}</li>
              </ol>
            </CoachMark.Description>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    const listElement = screen.getByRole("list");
    expect(screen.getByText(defaultCoachMarkDescription)).toHaveRole("listitem");
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-describedby", listElement.id);
  });

  it("throws an error when an invalid React element is passed a child", () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderTestCoachMark({
        useCoachMarkOptions: {
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Description>
                <p>Paragraph 1</p>
                <p>Paragraph 2</p>
              </CoachMark.Description>
            </CoachMark.Portal>
          ),
        },
        coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
      })
    ).toThrow();
    error.mockReset();
  });

  it("serves as the dialog's accessible description (via the aria-describedby attribute)", () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Description>
              <p>{defaultCoachMarkDescription}</p>
            </CoachMark.Description>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    const descriptionElement = screen.getByText(defaultCoachMarkDescription);
    const coachMark = screen.getByRole("dialog");
    expect(coachMark).toHaveAttribute("aria-describedby", descriptionElement.id);
    expect(coachMark).toHaveAccessibleDescription(defaultCoachMarkDescription);
  });
});

const clickDoneButton = async () => {
  const button = screen.getByRole("button", { name: "Done" });
  await userEvent.click(button);
};

const clickCloseButton = async () => {
  const button = screen.getByRole("button", { name: "Close" });
  await userEvent.click(button);
};

const pressEscapeKey = async () => await userEvent.keyboard("{Escape}");

const clickReferenceElement = async () => {
  await userEvent.click(getReferenceElement());
};

describe.each([
  ["the done button is clicked", clickDoneButton],
  ["the close button is clicked", clickCloseButton],
  ["the Escape key is pressed", pressEscapeKey],
  ["the reference element is clicked", clickReferenceElement],
])("dismissing the coach mark", (testCase, dismissEvent) => {
  it(`closes the dialog when ${testCase}`, async () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    expect(screen.getByText(defaultCoachMarkHeading)).toBeInTheDocument();
    await dismissEvent();
    expect(screen.queryByText(defaultCoachMarkHeading)).not.toBeInTheDocument();
  });

  it(`sets the hideCoachMark localStorage item and fires the 'click_close_coach_mark' GA event when ${testCase}`, async () => {
    const logEventSpy = jest.spyOn(logEvent, "logEvent");

    const coachMarkId = "multiple_file_upload";
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        id: coachMarkId,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    const hideCoachMarkKey = getHideCoachMarkStorageKey(coachMarkId);
    expect(localStorage.getItem(hideCoachMarkKey)).toBeNull();

    expect(screen.getByText(defaultCoachMarkHeading)).toBeInTheDocument();
    await dismissEvent();
    expect(screen.queryByText(defaultCoachMarkHeading)).not.toBeInTheDocument();

    expect(localStorage.getItem(hideCoachMarkKey)).toBe("true");
    expect(logEventSpy).toHaveBeenCalledWith("coach_mark_single_feat_dimiss", {
      coach_mark_id: coachMarkId,
    });
    expect(logEventSpy).toHaveBeenCalledTimes(1);
  });

  it(`removes the coachMarkActive class when ${testCase}`, async () => {
    renderTestCoachMark({
      useCoachMarkOptions: {
        ...DEFAULT_COACH_MARK_OPTIONS,
        coachMarkPortal: (
          <CoachMark.Portal allowedPlacements={["top"]}>
            <CoachMark.Heading>{defaultCoachMarkHeading}</CoachMark.Heading>
          </CoachMark.Portal>
        ),
      },
      coach_mark_expiration_date_iso: DEFAULT_EXPIRATION_DATE,
    });

    await dismissEvent();
    expect(getReferenceElement()).not.toHaveClass("coachMarkActive");
  });
});
