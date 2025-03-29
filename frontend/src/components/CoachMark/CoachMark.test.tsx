import type { ReactElement } from "react";
import { useRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as CoachMark from "./CoachMark";

interface ComponentWithCoachMarkProps {
  coachMarkPortal: ReactElement;
}

const ComponentWithCoachMark = (props: ComponentWithCoachMarkProps) => {
  const coachMarkReferenceRef = useRef(null);
  const coachMark = CoachMark.useCoachMark({
    referenceRef: coachMarkReferenceRef,
    coachMarkPortal: props.coachMarkPortal,
  });

  return (
    <CoachMark.Root coachMark={coachMark}>
      <p ref={coachMarkReferenceRef} {...coachMark.getReferenceProps()}>
        Reference element
      </p>
    </CoachMark.Root>
  );
};

describe(CoachMark.Root.name, () => {
  it("renders the component's children elements", () => {
    render(
      <ComponentWithCoachMark
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <h1 id="coachMarkHeading">Multiple file upload</h1>
            <p id="coachMarkDescription">You can now upload multiple files.</p>
          </CoachMark.Portal>
        }
      />
    );

    expect(screen.getByText("Reference element")).toBeInTheDocument();
  });

  it("throws an error when the 'coachMarkPortal' option is not a coachMarkPortal component", async () => {
    expect(() =>
      render(<ComponentWithCoachMark coachMarkPortal={<p>I'm not a CoachMarkPortal</p>} />)
    ).toThrow();
  });
});

describe(CoachMark.Portal.name, () => {
  it("renders its children on load (is open by default)", () => {
    const coachMarkHeading = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
            <CoachMark.Description>You can now upload multiple files.</CoachMark.Description>
          </CoachMark.Portal>
        }
      />
    );

    expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
  });

  it("renders a modal dialog whose accessible name and description are set by the CoachMarkHeading and CoachMarkDescription components", async () => {
    const coachMarkHeading = "Multiple file upload";
    const coachMarkDescription = "You can now upload multiple files.";
    render(
      <ComponentWithCoachMark
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
            <CoachMark.Description>{coachMarkDescription}</CoachMark.Description>
          </CoachMark.Portal>
        }
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
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
            <CoachMark.Description>You can now upload multiple files.</CoachMark.Description>
          </CoachMark.Portal>
        }
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
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <CoachMark.Heading>{coachMarkHeadingText}</CoachMark.Heading>
          </CoachMark.Portal>
        }
      />
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(within(heading).getByText(coachMarkHeadingText)).toBeInTheDocument();
  });

  it("serves as the dialog's accessible name (via the aria-labelledby attribute)", () => {
    const coachMarkHeadingText = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <CoachMark.Heading>{coachMarkHeadingText}</CoachMark.Heading>
          </CoachMark.Portal>
        }
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
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
            <CoachMark.Description>You can now upload multiple files.</CoachMark.Description>
          </CoachMark.Portal>
        }
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
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <CoachMark.Description>{description}</CoachMark.Description>
          </CoachMark.Portal>
        }
      />
    );
    expect(screen.getByText(description)).toHaveRole("paragraph");
  });

  it("serves as the dialog's accessible description (via the aria-describedby attribute)", () => {
    const description = "You can now upload multiple files";
    render(
      <ComponentWithCoachMark
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <CoachMark.Description>{description}</CoachMark.Description>
          </CoachMark.Portal>
        }
      />
    );
    const descriptionElement = screen.getByText(description);
    const coachMark = screen.getByRole("dialog");
    expect(coachMark).toHaveAttribute("aria-describedby", descriptionElement.id);
    expect(coachMark).toHaveAccessibleDescription(description);
  });
});
