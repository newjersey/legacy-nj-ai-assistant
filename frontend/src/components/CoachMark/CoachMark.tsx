import type { ReactNode, RefObject } from "react";
import { createContext, isValidElement, useContext, useEffect, useMemo, useState } from "react";
import type { Placement } from "@floating-ui/react";
import {
  FloatingFocusManager,
  FloatingOverlay,
  useDismiss,
  useFloating,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";

import styles from "./CoachMark.module.css";

export interface CoachMarkContent {
  placement: Placement;
  ariaLabelledBy: string;
  ariaDescribedBy: string;
  element: ReactNode;
}

interface CoachMarkOptions {
  referenceRef: RefObject<HTMLElement>;
  coachMarkContent: CoachMarkContent;
}

export const useCoachMark = (options: CoachMarkOptions) => {
  if (!isValidElement(options.coachMarkContent.element)) {
    throw Error("useCoachMark's the element prop of coachMarkContent must be a valid element!");
  }

  const [isOpen, setIsOpen] = useState(true);
  const [coachMark, setCoachMark] = useState<HTMLElement | null>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (options.referenceRef.current !== null) {
      setReferenceElement(options.referenceRef.current);
    }
  }, [options.referenceRef]);

  const floatingRootContext = useFloatingRootContext({
    open: isOpen,
    onOpenChange: setIsOpen,
    elements: {
      reference: referenceElement,
      floating: coachMark,
    },
  });

  const dismiss = useDismiss(floatingRootContext);

  const interactions = useInteractions([dismiss]);

  return useMemo(
    () => ({
      setCoachMark,
      setReferenceElement,
      isOpen,
      setIsOpen,
      coachMarkContent: options.coachMarkContent,
      ...interactions,
      ...floatingRootContext,
    }),
    [isOpen, options.coachMarkContent, interactions, floatingRootContext]
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

interface CoachMarkRootProps {
  coachMark: ReturnType<typeof useCoachMark>;
  children: ReactNode;
}

const CoachMarkRoot = (props: CoachMarkRootProps) => {
  return (
    <CoachMarkContext.Provider value={props.coachMark}>
      <CoachMarkPortal />
      {props.children}
    </CoachMarkContext.Provider>
  );
};

const CoachMarkPortal = () => {
  const coachMarkContext = useCoachMarkContext();
  const coachMarkContent = coachMarkContext.coachMarkContent;

  const { floatingStyles } = useFloating({
    placement: coachMarkContent.placement,
    rootContext: coachMarkContext,
  });

  if (!coachMarkContext.open) return null;

  return (
    <FloatingOverlay lockScroll className={styles.dialogOverlay}>
      <FloatingFocusManager context={coachMarkContext}>
        <div
          role="dialog"
          // TODO: add aria-modal=true
          aria-labelledby={coachMarkContent.ariaLabelledBy}
          aria-describedby={coachMarkContent.ariaDescribedBy}
          className="padding-2 bg-primary-lightest radius-2 shadow-2"
          ref={coachMarkContext.setCoachMark}
          style={floatingStyles}
          {...coachMarkContext.getFloatingProps()}
        >
          {coachMarkContent.element}
          <button onClick={() => coachMarkContext.setIsOpen(false)}>Done</button>
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );
};

const Root = CoachMarkRoot;

export { Root };
