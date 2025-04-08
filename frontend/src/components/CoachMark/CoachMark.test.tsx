import { useRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as logEvent from "../../utils/logEvent";

import * as CoachMark from "./CoachMark";

const DEFAULT_EXPIRATION_DATE = "2025-01-01";

const DEFAULT_COACH_MARK_OPTIONS: Omit<CoachMark.CoachMarkOptions, "referenceRef"> = {
  id: "",
  expirationDateUtc: DEFAULT_EXPIRATION_DATE,
  coachMarkPortal: (
    <CoachMark.Portal allowedPlacements={["top"]}>
      <></>
    </CoachMark.Portal>
  ),
};

const logEventSpy = jest.spyOn(logEvent, "logEvent");

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
    </CoachMark.Root>
  );
};

const getReferenceElement = (): HTMLElement => screen.getByText("Reference element");

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();

  jest.useFakeTimers({ advanceTimers: true });
  const oneDayBeforeExpiration = new Date(DEFAULT_EXPIRATION_DATE).getTime() - 24 * 60 * 60 * 1000;
  jest.setSystemTime(oneDayBeforeExpiration);
});

afterEach(() => {
  localStorage.clear();
  jest.useRealTimers();
});

describe(CoachMark.useCoachMark.name, () => {
  it(`sets the expirationDateCoachMark localStorage item if the coach mark's expiration date hasn't passed yet`, () => {
    jest.setSystemTime(new Date("2025-01-01"));
    const coachMarkId = "multiple-file-upload";
    const expirationDate = "2025-01-02";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          id: coachMarkId,
          expirationDateUtc: expirationDate,
        }}
      />
    );

    const coachMarkStorageKey = CoachMark.getExpirationDateCoachMarkStorageKey(coachMarkId);

    expect(localStorage.getItem(coachMarkStorageKey)).toBe(expirationDate);
  });

  it("does not set the coach_mark localStorage item if the coach mark is expired", () => {
    const coachMarkId = "multiple-file-upload";
    const expirationDate = "2025-01-02";
    jest.setSystemTime(new Date("2025-01-03"));
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          id: coachMarkId,
          expirationDateUtc: expirationDate,
        }}
      />
    );
    expect(
      localStorage.getItem(CoachMark.getExpirationDateCoachMarkStorageKey(coachMarkId))
    ).toBeNull();
  });

  it("removes the expirationDateCoachMark and hideCoachMark storage items if the coach mark is expired", () => {
    const coachMarkId = "multiple-file-upload";
    const expirationDate = "2025-01-02";
    jest.setSystemTime(new Date("2025-01-03"));

    const coachMarkStorageKey = CoachMark.getExpirationDateCoachMarkStorageKey(coachMarkId);
    localStorage.setItem(
      coachMarkStorageKey,
      JSON.stringify({
        id: coachMarkId,
        expiresOn: expirationDate,
      })
    );

    const hideCoachMarkKey = CoachMark.getHideCoachMarkStorageKey(coachMarkId);
    localStorage.setItem(hideCoachMarkKey, JSON.stringify(true));

    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          id: coachMarkId,
          expirationDateUtc: expirationDate,
        }}
      />
    );

    expect(localStorage.getItem(coachMarkStorageKey)).toBeNull();
    expect(localStorage.getItem(hideCoachMarkKey)).toBeNull();
  });
});

describe(CoachMark.Root.name, () => {
  it("renders the component's children elements", () => {
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Heading>Multiple file upload</CoachMark.Heading>
            </CoachMark.Portal>
          ),
        }}
      />
    );

    expect(getReferenceElement()).toBeInTheDocument();
  });

  it("throws an error when the 'coachMarkPortal' option is not a coachMarkPortal component", async () => {
    expect(() =>
      render(
        <ComponentWithCoachMark
          useCoachMarkOptions={{
            ...DEFAULT_COACH_MARK_OPTIONS,
            coachMarkPortal: <p>I'm not a CoachMarkPortal</p>,
          }}
        />
      )
    ).toThrow();
  });
});

describe(CoachMark.Portal.name, () => {
  it("renders its children on load (is open by default)", () => {
    const coachMarkHeading = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              <CoachMark.Description>You can now upload multiple files.</CoachMark.Description>
            </CoachMark.Portal>
          ),
        }}
      />
    );

    expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
  });

  it(`renders a modal dialog whose accessible name and description are set by the ${CoachMark.Heading.name} and ${CoachMark.Description.name} components`, async () => {
    const coachMarkHeading = "Multiple file upload";
    const coachMarkDescription = "You can now upload multiple files.";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              <CoachMark.Description>{coachMarkDescription}</CoachMark.Description>
            </CoachMark.Portal>
          ),
        }}
      />
    );
    const coachMark = screen.getByRole("dialog");
    expect(coachMark).toHaveAttribute("aria-modal", "true");
    expect(coachMark).toHaveAccessibleName(coachMarkHeading);
    expect(coachMark).toHaveAccessibleDescription(coachMarkDescription);
  });

  it(`does not set the dialog's accessible name/description when the ${CoachMark.Heading.name} and ${CoachMark.Description.name} components are absent`, async () => {
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

  describe("conditional logic for rendering", () => {
    it("does not render if the coach mark's expiration date has passed", () => {
      const expirationDate = "2025-01-02";
      jest.setSystemTime(new Date("2025-01-03"));

      const coachMarkHeading = "Multiple file upload";

      render(
        <ComponentWithCoachMark
          useCoachMarkOptions={{
            ...DEFAULT_COACH_MARK_OPTIONS,
            expirationDateUtc: expirationDate,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              </CoachMark.Portal>
            ),
          }}
        />
      );

      expect(screen.queryByRole("dialog", { name: coachMarkHeading })).not.toBeInTheDocument();
    });

    it("does not render if the hideCoachMark localStorage item has been set", () => {
      const coachMarkId = "multiple-file-upload";

      jest.setSystemTime(new Date("2025-01-01"));
      const expirationDate = "2025-01-02";

      const hideCoachMarkKey = CoachMark.getHideCoachMarkStorageKey(coachMarkId);
      localStorage.setItem(hideCoachMarkKey, "true");

      const coachMarkHeading = "Multiple file upload";

      render(
        <ComponentWithCoachMark
          useCoachMarkOptions={{
            ...DEFAULT_COACH_MARK_OPTIONS,
            id: coachMarkId,
            expirationDateUtc: expirationDate,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              </CoachMark.Portal>
            ),
          }}
        />
      );

      expect(screen.queryByRole("dialog", { name: coachMarkHeading })).not.toBeInTheDocument();
    });
  });
});

describe(CoachMark.Heading.name, () => {
  it("renders its children inside a heading level 1", () => {
    const coachMarkHeadingText = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Heading>{coachMarkHeadingText}</CoachMark.Heading>
            </CoachMark.Portal>
          ),
        }}
      />
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(within(heading).getByText(coachMarkHeadingText)).toBeInTheDocument();
  });

  it("serves as the dialog's accessible name (via the aria-labelledby attribute)", () => {
    const coachMarkHeadingText = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Heading>{coachMarkHeadingText}</CoachMark.Heading>
            </CoachMark.Portal>
          ),
        }}
      />
    );
    const heading = screen.getByRole("heading", { level: 1 });
    const coachMark = screen.getByRole("dialog");
    expect(coachMark).toHaveAttribute("aria-labelledby", heading.id);
    expect(coachMark).toHaveAccessibleName(coachMarkHeadingText);
  });
});

describe(CoachMark.Description.name, () => {
  it("renders its children inside a paragraph by default", () => {
    const description = "You can now upload multiple files";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Description>{description}</CoachMark.Description>
            </CoachMark.Portal>
          ),
        }}
      />
    );
    expect(screen.getByText(description)).toHaveRole("paragraph");
  });

  it("renders its children alone (not in a paragraph) when the asChild prop is true", () => {
    const descriptionText = "New feature #1";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Description asChild={true}>
                <ol>
                  <li>{descriptionText}</li>
                </ol>
              </CoachMark.Description>
            </CoachMark.Portal>
          ),
        }}
      />
    );
    const listElement = screen.getByRole("list");
    expect(screen.getByText(descriptionText)).toHaveRole("listitem");
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-describedby", listElement.id);
  });

  it("throws an error when the asChild prop is true and an invalid React element is passed a child", () => {
    expect(() =>
      render(
        <ComponentWithCoachMark
          useCoachMarkOptions={{
            ...DEFAULT_COACH_MARK_OPTIONS,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Description asChild={true}>
                  <p>Paragraph 1</p>
                  <p>Paragraph 2</p>
                </CoachMark.Description>
              </CoachMark.Portal>
            ),
          }}
        />
      )
    ).toThrow();
  });

  it("serves as the dialog's accessible description (via the aria-describedby attribute)", () => {
    const description = "You can now upload multiple files";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal allowedPlacements={["top"]}>
              <CoachMark.Description>{description}</CoachMark.Description>
            </CoachMark.Portal>
          ),
        }}
      />
    );
    const descriptionElement = screen.getByText(description);
    const coachMark = screen.getByRole("dialog");
    expect(coachMark).toHaveAttribute("aria-describedby", descriptionElement.id);
    expect(coachMark).toHaveAccessibleDescription(description);
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

describe.each([
  ["the done button is clicked", clickDoneButton],
  ["the close button is clicked", clickCloseButton],
  ["Floating UI's dismiss interaction is triggered (e.g. pressing the Escape key)", pressEscapeKey],
])("dismissing the coach mark", (testCase, dismissEvent) => {
  describe(`when ${testCase}`, () => {
    it("closes the dialog", async () => {
      const coachMarkHeading = "Multiple file upload";
      render(
        <ComponentWithCoachMark
          useCoachMarkOptions={{
            ...DEFAULT_COACH_MARK_OPTIONS,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
                <CoachMark.Description>You can now upload multiple files.</CoachMark.Description>
              </CoachMark.Portal>
            ),
          }}
        />
      );

      expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
      await dismissEvent();
      expect(screen.queryByText(coachMarkHeading)).not.toBeInTheDocument();
    });

    it("sets the hideCoachMark localStorage item and fires the 'click_close_coach_mark' GA event", async () => {
      const coachMarkHeading = "Multiple file upload";
      const coachMarkId = "multiple_file_upload";
      render(
        <ComponentWithCoachMark
          useCoachMarkOptions={{
            ...DEFAULT_COACH_MARK_OPTIONS,
            id: coachMarkId,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              </CoachMark.Portal>
            ),
          }}
        />
      );
      const hideCoachMarkKey = CoachMark.getHideCoachMarkStorageKey(coachMarkId);
      expect(localStorage.getItem(hideCoachMarkKey)).toBeNull();

      expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
      await dismissEvent();
      expect(screen.queryByText(coachMarkHeading)).not.toBeInTheDocument();

      expect(localStorage.getItem(hideCoachMarkKey)).toBe("true");
      expect(logEventSpy).toHaveBeenCalledTimes(1);
      expect(logEventSpy).toHaveBeenCalledWith("click_close_coach_mark", {
        coach_mark_id: coachMarkId,
      });
    });

    it("removes the coachMarkActive class", async () => {
      const coachMarkHeading = "Multiple file upload";
      render(
        <ComponentWithCoachMark
          useCoachMarkOptions={{
            ...DEFAULT_COACH_MARK_OPTIONS,
            coachMarkPortal: (
              <CoachMark.Portal allowedPlacements={["top"]}>
                <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
                <CoachMark.Description>You can now upload multiple files.</CoachMark.Description>
              </CoachMark.Portal>
            ),
          }}
        />
      );

      await dismissEvent();
      expect(getReferenceElement()).not.toHaveClass("coachMarkActive");
    });
  });
});
