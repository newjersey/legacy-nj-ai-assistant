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

  it("renders the coach mark content on component load", () => {
    const coachMarkHeading = "Multiple file upload";
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

    expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
  });

  it.skip("renders a modal dialog whose accessible name and description are set by the ariaLabelledBy and ariaDescribedBy values", async () => {
    const coachMarkHeading = "Multiple file upload";
    const coachMarkDescription = "You can now upload multiple files.";
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
            <h1 id="coachMarkHeading">Multiple file upload</h1>
            <p id="coachMarkDescription">You can now upload multiple files.</p>
          </CoachMark.Portal>
        }
      />
    );

    expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
    const doneButton = screen.getByRole("button", { name: "Done" });
    await userEvent.click(doneButton);
    expect(screen.queryByText(coachMarkHeading)).not.toBeInTheDocument();
  });

  it("throws an error when the 'coachMarkPortal' option is not a coachMarkPortal component", async () => {
    expect(() =>
      render(<ComponentWithCoachMark coachMarkPortal={<p>I'm not a CoachMarkPortal</p>} />)
    ).toThrow();
  });
});

describe(CoachMark.Heading.name, () => {
  it("renders its children elements inside a heading level 1", () => {
    const coachMarkHeading = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
          </CoachMark.Portal>
        }
      />
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(within(heading).getByText(coachMarkHeading)).toBeInTheDocument();
  });

  it("sets the aria-label on the coach mark dialog", () => {
    const coachMarkHeading = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        coachMarkPortal={
          <CoachMark.Portal placement="top">
            <CoachMark.Heading>{coachMarkHeading}</CoachMark.Heading>
          </CoachMark.Portal>
        }
      />
    );
    const heading = screen.getByRole("heading", { level: 1 });
    const coachMark = screen.getByRole("dialog");
    expect(coachMark).toHaveAttribute("aria-labelledby", heading.id);
    expect(coachMark).toHaveAccessibleName(coachMarkHeading);
  });
});
