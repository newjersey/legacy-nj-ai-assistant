import type { CSSProperties } from "react";

interface Props {
  setFloatingElement: (node: HTMLElement | null) => void;
  floatingStyles: CSSProperties;
}

export const CoachMark = (props: Props) => {
  return (
    <div
      className="padding-2 bg-primary-lightest radius-2 shadow-2"
      ref={props.setFloatingElement}
      style={props.floatingStyles}
    >
      Some tooltip text
    </div>
  );
};
