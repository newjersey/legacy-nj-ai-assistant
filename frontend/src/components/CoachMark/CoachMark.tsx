import type { ReactElement, ReactNode, RefObject } from "react";
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Placement } from "@floating-ui/react";
import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingFocusManager,
  FloatingOverlay,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";
import icons from "@newjersey/njwds/dist/img/sprite.svg";

import styles from "./CoachMark.module.css";

const ARROW_HEIGHT = 7;
const GAP = 8;

const SHOW_COACH_MARK_LOCAL_STORAGE_KEY_PREFIX = "show_coach_mark";

interface ShowCoachMarkLocalStorageItem {
  id: string;
  expiresOn: Date;
}

/*
in useCoachMark:
key: show_coach_mark__multiple_file_upload
value: { name: "multiple_file_upload", expire_in: <timestamp> }
^ if current date is past expire_in, delete key

when Done button is pressed, add the item: 
key: hide_coach_mark__multiple_file_upload
value: true 
^ don't show CoachMark portal if hide_coach_mark__multiple_file_upload is
present

*/

export interface CoachMarkOptions {
  id: string;
  expiresOn: Date;
  referenceRef: RefObject<HTMLElement>;
  coachMarkPortal: ReactElement;
}

const setShowCoachMarkItemInLocalStorage = (id: string, expiresOn: Date) => {
  const showCoachMarkKey = `${SHOW_COACH_MARK_LOCAL_STORAGE_KEY_PREFIX}__${id}`;
  const showCoachMarkValue: ShowCoachMarkLocalStorageItem = {
    id: id,
    expiresOn: expiresOn,
  };
  localStorage.setItem(showCoachMarkKey, JSON.stringify(showCoachMarkValue));
};

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

  const arrowRef = useRef(null);

  const { floatingStyles, context } = useFloating({
    placement: props.placement,
    rootContext: coachMarkContext,
    whileElementsMounted: autoUpdate,
    middleware: [shift(), flip(), arrow({ element: arrowRef }), offset(ARROW_HEIGHT + GAP)],
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
          className="flex padding-2 bg-primary-lightest radius-lg shadow-2"
          ref={coachMarkContext.setCoachMark}
          style={floatingStyles}
          {...coachMarkContext.getFloatingProps()}
        >
          {props.children}
          <div className="display-flex flex-justify-end">
            <button className="usa-button" onClick={() => coachMarkContext.setIsOpen(false)}>
              Done
            </button>
          </div>
          <FloatingArrow ref={arrowRef} context={context} fill="#e8f5ff" />
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

  return (
    <div className="display-flex flex-justify">
      <h1 id={coachMarkContext.headingId} className="font-sans-lg">
        {props.children}
      </h1>
      <CloseButton
        handleClick={() => {
          coachMarkContext.setIsOpen(false);
        }}
      />
    </div>
  );
};

interface CoachMarkDescriptionProps {
  children: ReactNode;
}

const CoachMarkDescription = (props: CoachMarkDescriptionProps) => {
  const coachMarkContext = useCoachMarkContext();

  return (
    <p id={coachMarkContext.descriptionId} className="margin-top-0">
      {props.children}
    </p>
  );
};

interface CloseButtonProps {
  handleClick: () => void;
}

// TODO: Refactor with button in ErrorAlert
const CloseButton = (props: CloseButtonProps) => {
  return (
    <button
      className="usa-button usa-button--unstyled"
      onClick={props.handleClick}
      aria-label="Close"
    >
      <svg className="usa-icon text-ink" aria-hidden="true" focusable="false" role="img">
        <use href={`${icons}#close`}></use>
      </svg>
    </button>
  );
};

const Root = CoachMarkRoot;
const Portal = CoachMarkPortal;
const Heading = CoachMarkHeading;
const Description = CoachMarkDescription;

export { Description, Heading, Portal, Root };
