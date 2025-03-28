import type { ReactElement, ReactNode, RefObject } from "react";
import { createContext, useContext, useEffect, useId, useMemo, useState } from "react";
import type { Placement } from "@floating-ui/react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingOverlay,
  shift,
  useDismiss,
  useFloating,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";

import styles from "./CoachMark.module.css";

interface CoachMarkOptions {
  referenceRef: RefObject<HTMLElement>;
  coachMarkPortal: ReactElement;
}

export const useCoachMark = (options: CoachMarkOptions) => {
  if (options.coachMarkPortal.type !== CoachMarkPortal) {
    throw Error("useCoachMark's coachMarkPortal option must be a <CoachMark.Portal> component!");
  }

  const [isOpen, setIsOpen] = useState(true);
  const [coachMark, setCoachMark] = useState<HTMLElement | null>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  const coachMarkId = useId();

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
      coachMarkPortal: options.coachMarkPortal,
      headingId: `${coachMarkId}-heading`,
      descriptionId: `${coachMarkId}-description`,
      ...interactions,
      ...floatingRootContext,
    }),
    [isOpen, options.coachMarkPortal, coachMarkId, interactions, floatingRootContext]
  );
};

type CoachMarkContextType = ReturnType<typeof useCoachMark> | null;

const CoachMarkContext = createContext<CoachMarkContextType>(null);

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
      {props.coachMark.coachMarkPortal}
      {props.children}
    </CoachMarkContext.Provider>
  );
};

// type CoachMarkPortalContextType = {
//   labelId: string;
//   descriptionId: string;
// } | null;

// const CoachMarkPortalContext = createContext<CoachMarkPortalContextType>(null);

interface CoachMarkPortalProps {
  placement: Placement;
  children: ReactNode;
}

const CoachMarkPortal = (props: CoachMarkPortalProps) => {
  const coachMarkContext = useCoachMarkContext();

  const { floatingStyles } = useFloating({
    placement: props.placement,
    rootContext: coachMarkContext,
    whileElementsMounted: autoUpdate,
    middleware: [shift(), flip()],
  });

  if (!coachMarkContext.open) return null;

  return (
    <FloatingOverlay lockScroll className={styles.dialogOverlay}>
      <FloatingFocusManager context={coachMarkContext}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={coachMarkContext.headingId}
          aria-describedby={coachMarkContext.descriptionId}
          className="padding-2 bg-primary-lightest radius-2 shadow-2"
          ref={coachMarkContext.setCoachMark}
          style={floatingStyles}
          {...coachMarkContext.getFloatingProps()}
        >
          {props.children}
          <button onClick={() => coachMarkContext.setIsOpen(false)}>Done</button>
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );
};

interface CoachMarkHeadingProps {
  children: ReactNode;
}

const CoachMarkHeading = (props: CoachMarkHeadingProps) => {
  const coachMarkContext = useCoachMarkContext();

  return <h1 id={coachMarkContext.headingId}>{props.children}</h1>;
};

const Root = CoachMarkRoot;
const Portal = CoachMarkPortal;
const Heading = CoachMarkHeading;

export { Heading, Portal, Root };
