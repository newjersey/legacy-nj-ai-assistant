import { useRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as CoachMark from "./CoachMark";

const DEFAULT_COACH_MARK_OPTIONS: Omit<CoachMark.CoachMarkOptions, "referenceRef"> = {
  id: "",
  expiresOn: "2025-01-02",
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

describe(CoachMark.useCoachMark.name, () => {
  beforeAll(() => localStorage.clear());

  afterEach(() => localStorage.clear());
  it("sets a localStorage item containing the coach mark's id and expiration time", () => {
    const coachMarkId = "multiple-file-upload";
    const expirationDate = "2026-01-02";
    render(
      <ComponentWithCoachMark
        useCoachMarkOptions={{
          ...DEFAULT_COACH_MARK_OPTIONS,
          id: coachMarkId,
          expiresOn: expirationDate,
          coachMarkPortal: (
            <CoachMark.Portal placement="top">
              <CoachMark.Heading>Multiple file upload</CoachMark.Heading>
            </CoachMark.Portal>
          ),
        }}
      />
    );

    const localStorageKey = "show_coach_mark__multiple-file-upload";
    const localStorageValue = localStorage.getItem(localStorageKey);

    expect(localStorageValue).not.toBeNull();

    expect(JSON.parse(localStorageValue as string)).toStrictEqual({
      id: coachMarkId,
      expiresOn: expirationDate,
    });
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

// TODO: test that aria-label/aria-described-by is only set if the heading and description elements are present
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

  it("renders a modal dialog whose accessible name and description are set by the CoachMarkHeading and CoachMarkDescription components", async () => {
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
  it("renders its children inside a paragraph", () => {
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
