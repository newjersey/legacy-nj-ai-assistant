import { useRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as CoachMark from "./CoachMark";

interface ComponentWithCoachMarkProps {
  coachMarkContent: CoachMark.CoachMarkContent;
}

const ComponentWithCoachMark = (props: ComponentWithCoachMarkProps) => {
  const coachMarkReferenceRef = useRef(null);
  const coachMark = CoachMark.useCoachMark({
    referenceRef: coachMarkReferenceRef,
    coachMarkContent: {
      placement: "top",
      ariaLabelledBy: props.coachMarkContent.ariaLabelledBy,
      ariaDescribedBy: props.coachMarkContent.ariaDescribedBy,
      element: props.coachMarkContent.element,
    },
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
        coachMarkContent={{
          placement: "top",
          ariaLabelledBy: "coachMarkHeading",
          ariaDescribedBy: "coachMarkDescription",
          element: (
            <>
              <h1 id="coachMarkHeading">"Multiple file upload"</h1>
              <p id="coachMarkDescription">You can now upload multiple files.</p>
            </>
          ),
        }}
      />
    );

    expect(screen.getByText("Reference element")).toBeInTheDocument();
  });

  it("renders the coach mark content on component load", () => {
    const coachMarkHeading = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        coachMarkContent={{
          placement: "top",
          ariaLabelledBy: "coachMarkHeading",
          ariaDescribedBy: "coachMarkDescription",
          element: (
            <>
              <h1 id="coachMarkHeading">{coachMarkHeading}</h1>
              <p id="coachMarkDescription">You can now upload multiple files.</p>
            </>
          ),
        }}
      />
    );

    expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
  });

  it("renders a dialog whose accessible name and description are set by the ariaLabelledBy and ariaDescribedBy values", async () => {
    const coachMarkHeading = "Multiple file upload";
    const coachMarkDescription = "You can now upload multiple files.";
    render(
      <ComponentWithCoachMark
        coachMarkContent={{
          placement: "top",
          ariaLabelledBy: "coachMarkHeading",
          ariaDescribedBy: "coachMarkDescription",
          element: (
            <>
              <h1 id="coachMarkHeading">{coachMarkHeading}</h1>
              <p id="coachMarkDescription">{coachMarkDescription}</p>
            </>
          ),
        }}
      />
    );
    const coachMark = screen.getByRole("dialog");
    expect(coachMark).toHaveAccessibleName(coachMarkHeading);
    expect(coachMark).toHaveAccessibleDescription(coachMarkDescription);
  });

  it("closes the coach mark when the 'Done' button is pressed", async () => {
    const coachMarkHeading = "Multiple file upload";
    render(
      <ComponentWithCoachMark
        coachMarkContent={{
          placement: "top",
          ariaLabelledBy: "coachMarkHeading",
          ariaDescribedBy: "coachMarkDescription",
          element: (
            <>
              <h1 id="coachMarkHeading">{coachMarkHeading}</h1>
              <p id="coachMarkDescription">You can now upload multiple files.</p>
            </>
          ),
        }}
      />
    );

    expect(screen.getByText(coachMarkHeading)).toBeInTheDocument();
    const doneButton = screen.getByRole("button", { name: "Done" });
    await userEvent.click(doneButton);
    expect(screen.queryByText(coachMarkHeading)).not.toBeInTheDocument();
  });

  it("throws an error when the 'coachMarkContent' option is not a valid element", async () => {
    const invalidElement = 24;
    expect(() =>
      render(
        <ComponentWithCoachMark
          coachMarkContent={{
            placement: "top",
            ariaLabelledBy: "",
            ariaDescribedBy: "",
            element: invalidElement,
          }}
        />
      )
    ).toThrow();
  });
});
