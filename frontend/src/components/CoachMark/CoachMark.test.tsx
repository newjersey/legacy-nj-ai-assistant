import { useRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as CoachMark from "./CoachMark";

const DEFAULT_EXPIRATION_DATE = "2025-01-01";

const DEFAULT_COACH_MARK_OPTIONS: Omit<CoachMark.CoachMarkOptions, "referenceRef"> = {
  id: "",
  expiresOn: DEFAULT_EXPIRATION_DATE,
  coachMarkPortal: (
    <CoachMark.Portal placement="top">
      <></>
    </CoachMark.Portal>
  ),
};

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

beforeEach(() => {
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
  it("sets the coach_mark localStorage item if the coach mark's expiration date hasn't passed yet", () => {
    jest.setSystemTime(new Date("2025-01-01"));
    const coachMarkId = "multiple-file-upload";
    const expirationDate = "2025-01-02";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          id: coachMarkId,
          expiresOn: expirationDate,
        }}
      />
    );

    const coachMarkStorageKey = CoachMark.getCoachMarkStorageKey(coachMarkId);
    const coachMarkStorageValue = localStorage.getItem(coachMarkStorageKey);

    expect(JSON.parse(coachMarkStorageValue as string)).toStrictEqual({
      id: coachMarkId,
      expiresOn: expirationDate,
    });
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
          expiresOn: expirationDate,
        }}
      />
    );
    expect(localStorage.getItem(CoachMark.getCoachMarkStorageKey(coachMarkId))).toBeNull();
  });

  it("removes the coachMark and hideCoachMark storage items if the coach mark is expired", () => {
    const coachMarkId = "multiple-file-upload";
    const expirationDate = "2025-01-02";
    jest.setSystemTime(new Date("2025-01-03"));

    const coachMarkStorageKey = CoachMark.getCoachMarkStorageKey(coachMarkId);
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
          expiresOn: expirationDate,
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
            <CoachMark.Portal placement="top">
              <CoachMark.Heading>Multiple file upload</CoachMark.Heading>
            </CoachMark.Portal>
          ),
        }}
      />
    );

    expect(screen.getByText("Reference element")).toBeInTheDocument();
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
            <CoachMark.Portal placement="top">
              <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              <CoachMark.Description>You can now upload multiple files.</CoachMark.Description>
            </CoachMark.Portal>
          ),
        }}
      />
    );

    expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
  });

  it("closes the coach mark when the 'Done' button is pressed", async () => {
    const coachMarkHeading = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal placement="top">
              <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              <CoachMark.Description>You can now upload multiple files.</CoachMark.Description>
            </CoachMark.Portal>
          ),
        }}
      />
    );

    expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
    const doneButton = screen.getByRole("button", { name: "Done" });
    await userEvent.click(doneButton);
    expect(screen.queryByText(coachMarkHeading)).not.toBeInTheDocument();
  });

  it(`renders a modal dialog whose accessible name and description are set by the ${CoachMark.Heading.name} and ${CoachMark.Description.name} components`, async () => {
    const coachMarkHeading = "Multiple file upload";
    const coachMarkDescription = "You can now upload multiple files.";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal placement="top">
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
            <CoachMark.Portal placement="top">
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

  describe("conditional logic for rendering", () => {
    it("does not render if the coach mark's expiration date has passed", () => {
      const expirationDate = "2025-01-02";
      jest.setSystemTime(new Date("2025-01-03"));

      const coachMarkHeading = "Multiple file upload";

      render(
        <ComponentWithCoachMark
          useCoachMarkOptions={{
            ...DEFAULT_COACH_MARK_OPTIONS,
            expiresOn: expirationDate,
            coachMarkPortal: (
              <CoachMark.Portal placement="top">
                <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              </CoachMark.Portal>
            ),
          }}
        />
      );

      expect(screen.queryByRole("dialog", { name: coachMarkHeading })).not.toBeInTheDocument();
    });

    it("sets the hideCoachMark localStorage item when the coach mark is dismissed", async () => {
      const coachMarkHeading = "Multiple file upload";
      const coachMarkId = "multiple_file_upload";
      render(
        <ComponentWithCoachMark
          useCoachMarkOptions={{
            ...DEFAULT_COACH_MARK_OPTIONS,
            id: coachMarkId,
            coachMarkPortal: (
              <CoachMark.Portal placement="top">
                <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              </CoachMark.Portal>
            ),
          }}
        />
      );
      const hideCoachMarkKey = CoachMark.getHideCoachMarkStorageKey(coachMarkId);
      expect(localStorage.getItem(hideCoachMarkKey)).toBeNull();

      const doneButton = screen.getByRole("button", { name: "Done" });
      await userEvent.click(doneButton);
      expect(doneButton).not.toBeInTheDocument();

      expect(localStorage.getItem(hideCoachMarkKey)).toBe("true");
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
            expiresOn: expirationDate,
            coachMarkPortal: (
              <CoachMark.Portal placement="top">
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
            <CoachMark.Portal placement="top">
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
            <CoachMark.Portal placement="top">
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

  it("renders a close button that closes the dialog", async () => {
    const coachMarkHeading = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal placement="top">
              <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
              <CoachMark.Description>You can now upload multiple files.</CoachMark.Description>
            </CoachMark.Portal>
          ),
        }}
      />
    );

    expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
    const closeButton = screen.getByRole("button", { name: "Close" });
    await userEvent.click(closeButton);
    expect(screen.queryByText(coachMarkHeading)).not.toBeInTheDocument();
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
            <CoachMark.Portal placement="top">
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
            <CoachMark.Portal placement="top">
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
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    expect(screen.getByText(descriptionText)).toHaveRole("listitem");
  });

  it("serves as the dialog's accessible description (via the aria-describedby attribute)", () => {
    const description = "You can now upload multiple files";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          coachMarkPortal: (
            <CoachMark.Portal placement="top">
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

// TODO: add test for close button (including localstorage)
