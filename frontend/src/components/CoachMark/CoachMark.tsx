import type { Dispatch, HTMLProps, SetStateAction } from "react";
import type { FloatingRootContext, ReferenceType } from "@floating-ui/react";
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingOverlay,
  shift,
  useFloating,
} from "@floating-ui/react";

import styles from "./CoachMark.module.css";

interface Props {
  rootContext: FloatingRootContext<ReferenceType>;
  setCoachMark: Dispatch<SetStateAction<HTMLElement | null>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  getFloatingProps: (userProps?: HTMLProps<HTMLElement>) => Record<string, unknown>;
}

export const CoachMark = (props: Props) => {
  const { floatingStyles } = useFloating({
    rootContext: props.rootContext,
    placement: "top",
    whileElementsMounted: autoUpdate,
    middleware: [shift()],
  });

  return (
    <FloatingOverlay lockScroll className={styles.dialogOverlay}>
      <FloatingFocusManager context={props.rootContext}>
        <div
          className="padding-2 bg-primary-lightest radius-2 shadow-2"
          ref={props.setCoachMark}
          style={floatingStyles}
          {...props.getFloatingProps()}
        >
          <p>Some tooltip text</p>
          <button onClick={() => props.setIsOpen(false)}>Done</button>
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );
};
