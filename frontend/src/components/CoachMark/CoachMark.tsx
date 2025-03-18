import type { Dispatch, SetStateAction } from "react";
import type { FloatingRootContext, ReferenceType } from "@floating-ui/react";
import { autoUpdate, shift, useFloating } from "@floating-ui/react";

interface Props {
  rootContext: FloatingRootContext<ReferenceType>;
  setCoachMark: Dispatch<SetStateAction<HTMLElement | null>>;
}

export const CoachMark = (props: Props) => {
  const { floatingStyles } = useFloating({
    rootContext: props.rootContext,
    placement: "top",
    whileElementsMounted: autoUpdate,
    middleware: [shift()],
  });

  return (
    <div
      className="padding-2 bg-primary-lightest radius-2 shadow-2"
      ref={props.setCoachMark}
      style={floatingStyles}
    >
      Some tooltip text
    </div>
  );
};
