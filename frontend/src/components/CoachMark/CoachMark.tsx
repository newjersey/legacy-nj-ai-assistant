import type { ReactNode } from "react";
import { cloneElement, createContext, isValidElement, useContext, useMemo, useState } from "react";
import type { Placement } from "@floating-ui/react";
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingOverlay,
  shift,
  useFloating,
  useInteractions,
} from "@floating-ui/react";

import styles from "./CoachMark.module.css";

interface CoachMarkOptions {
  placement: Placement;
}

export const useCoachMark = ({ placement }: CoachMarkOptions) => {
  const [isOpen, setIsOpen] = useState(true);

  const floatingData = useFloating({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [shift()],
  });

  const interactions = useInteractions([]);

  return useMemo(
    () => ({
      isOpen,
      setIsOpen,
      ...interactions,
      ...floatingData,
    }),
    [isOpen, setIsOpen, interactions, floatingData]
  );
};

type ContextType = ReturnType<typeof useCoachMark> | null;

const CoachMarkContext = createContext<ContextType>(null);

export const useCoachMarkContext = () => {
  const context = useContext(CoachMarkContext);
  if (context == null) {
    throw new Error("CoachMark components must be wrapped in <CoachMark.Root />");
  }

  return context;
};

interface CoachMarkRootProps extends CoachMarkOptions {
  children: ReactNode;
}

const CoachMarkRoot = ({ children, ...coachMarkOptions }: CoachMarkRootProps) => {
  const coachMark = useCoachMark({ ...coachMarkOptions });

  return <CoachMarkContext.Provider value={coachMark}>{children}</CoachMarkContext.Provider>;
};

interface CoachMarkReferenceProps {
  children: ReactNode;
}

export const CoachMarkReference = (props: CoachMarkReferenceProps) => {
  const coachMarkContext = useCoachMarkContext();

  if (!isValidElement(props.children)) {
    throw Error("CoachMarkReference's child must be a valid React element");
  }

  return cloneElement(props.children, {
    ref: coachMarkContext.refs.setReference,
    ...props.children.props,
    ...coachMarkContext.getReferenceProps(),
  });
};

interface CoachMarkContentProps {
  children: ReactNode;
}

const CoachMarkContent = (props: CoachMarkContentProps) => {
  const coachMarkContext = useCoachMarkContext();

  if (!coachMarkContext.context.open) return null;

  return (
    <FloatingOverlay lockScroll className={styles.dialogOverlay}>
      <FloatingFocusManager context={coachMarkContext.context}>
        <div
          className="padding-2 bg-primary-lightest radius-2 shadow-2"
          ref={coachMarkContext.refs.setFloating}
          style={coachMarkContext.floatingStyles}
          {...coachMarkContext.getFloatingProps()}
        >
          {props.children}
          <button onClick={() => coachMarkContext.setIsOpen(false)}>Done</button>
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );
};

const Root = CoachMarkRoot;
const Reference = CoachMarkReference;
const Content = CoachMarkContent;

export { Content, Reference, Root };
