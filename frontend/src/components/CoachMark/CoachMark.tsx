import type { ReactNode, RefObject } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  FloatingFocusManager,
  FloatingOverlay,
  useDismiss,
  useFloating,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";

import styles from "./CoachMark.module.css";

/*

const coachMarks = [
  {
    ref: ref1
    content: <p>content1</p>
  },
   {
    ref: ref2
    content: <p>content2</p>
  }
]
*/

interface CoachMarkOptions {
  referenceRef: RefObject<HTMLElement>;
  coachMarkContent: ReactNode;
}

export const useCoachMark = (options: CoachMarkOptions) => {
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
      <CoachMarkPortal>{props.coachMark.coachMarkContent}</CoachMarkPortal>
      {props.children}
    </CoachMarkContext.Provider>
  );
};

// interface CoachMarkReferenceProps {
//   children: ReactNode;
// }

// export const CoachMarkReference = (props: CoachMarkReferenceProps) => {
//   const coachMarkContext = useCoachMarkContext();

//   if (!isValidElement(props.children)) {
//     throw Error("CoachMarkReference's child must be a valid React element");
//   }

//   return cloneElement(props.children, {
//     ref: coachMarkContext.refs.setReference,
//     ...props.children.props,
//     ...coachMarkContext.getReferenceProps(),
//   });
// };

interface CoachMarkPortalProps {
  children: ReactNode;
}

const CoachMarkPortal = (props: CoachMarkPortalProps) => {
  const coachMarkContext = useCoachMarkContext();

  const { floatingStyles } = useFloating({
    placement: "top",
    rootContext: coachMarkContext,
  });

  if (!coachMarkContext.open) return null;

  return (
    <FloatingOverlay lockScroll className={styles.dialogOverlay}>
      <FloatingFocusManager context={coachMarkContext}>
        <div
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

const Root = CoachMarkRoot;
// const Reference = CoachMarkReference;
const Portal = CoachMarkPortal;

export { Portal, Root };
