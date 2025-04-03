import type { ReactElement, ReactNode, RefObject } from "react";
import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

import { logEvent } from "../../utils/logEvent";
import { CloseButton } from "../common/Button";

import styles from "./CoachMark.module.css";

const ARROW_HEIGHT = 7;
const GAP = 8;

const COACH_MARK_STORAGE_KEY_PREFIX = "coach_mark";
const HIDE_COACH_MARK_STORAGE_KEY_PREFIX = "hide_coach_mark";

export const getCoachMarkStorageKey = (id: string) => {
  return `${COACH_MARK_STORAGE_KEY_PREFIX}__${id}`;
};

export const getHideCoachMarkStorageKey = (id: string) => {
  return `${HIDE_COACH_MARK_STORAGE_KEY_PREFIX}__${id}`;
};

const setCoachMarkStorageItem = (id: string, expiresOn: string) => {
  const showCoachMarkValue: {
    id: string;
    expiresOn: string;
  } = { id, expiresOn };
  localStorage.setItem(getCoachMarkStorageKey(id), JSON.stringify(showCoachMarkValue));
};

const setHideCoachMarkStorageItem = (id: string) => {
  localStorage.setItem(getHideCoachMarkStorageKey(id), JSON.stringify(true));
};

const isCoachMarkExpired = (expiresOnUtcString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiresOn = new Date(expiresOnUtcString);
  expiresOn.setHours(0, 0, 0, 0);
  return today > expiresOn;
};

export interface CoachMarkOptions {
  id: string;
  expiresOn: string;
  referenceRef: RefObject<HTMLElement>;
  coachMarkPortal: ReactElement;
}

export const useCoachMark = (options: CoachMarkOptions) => {
  if (options.coachMarkPortal.type !== CoachMarkPortal) {
    throw Error("useCoachMark's coachMarkPortal option must be a <CoachMark.Portal> component!");
  }

  const hideCoachMarkStorageKey = getHideCoachMarkStorageKey(options.id);
  const isDimissed = localStorage.getItem(hideCoachMarkStorageKey) != null;

  const isExpired = isCoachMarkExpired(options.expiresOn);
  if (!isExpired) {
    setCoachMarkStorageItem(options.id, options.expiresOn);
  } else {
    localStorage.removeItem(getCoachMarkStorageKey(options.id));
    localStorage.removeItem(hideCoachMarkStorageKey);
  }

  const [isOpen, setIsOpen] = useState(!(isExpired || isDimissed));
  const [coachMark, setCoachMark] = useState<HTMLElement | null>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    setHideCoachMarkStorageItem(options.id);
    logEvent("click_close_coach_mark", {
      coach_mark_id: options.id,
    });
  }, [options.id]);

  useEffect(() => {
    if (options.referenceRef.current !== null) {
      setReferenceElement(options.referenceRef.current);
    }
  }, [options.referenceRef]);

  const floatingRootContext = useFloatingRootContext({
    open: isOpen,
    onOpenChange(nextOpen) {
      if (nextOpen === false) {
        handleDismiss();
      } else {
        setIsOpen(nextOpen);
      }
    },
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
      handleDismiss,
      coachMarkPortal: options.coachMarkPortal,
      coachMarkId: options.id,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
      ...interactions,
      ...floatingRootContext,
    }),
    [
      isOpen,
      handleDismiss,
      options.coachMarkPortal,
      options.id,
      labelId,
      descriptionId,
      interactions,
      floatingRootContext,
    ]
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
          id={coachMarkContext.coachMarkId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={coachMarkContext.labelId}
          aria-describedby={coachMarkContext.descriptionId}
          className="flex padding-2 bg-primary-lightest radius-lg shadow-2 maxw-mobile"
          ref={coachMarkContext.setCoachMark}
          style={floatingStyles}
          {...coachMarkContext.getFloatingProps()}
        >
          {props.children}
          <div className="display-flex flex-justify-end">
            <button className="usa-button font-sans-2xs" onClick={coachMarkContext.handleDismiss}>
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
  const { coachMarkId, setLabelId, handleDismiss } = useCoachMarkContext();
  const id = `${coachMarkId}-heading`;

  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return (
    <div className="display-flex flex-justify">
      <h1 id={id} className="font-sans-md">
        {props.children}
      </h1>
      <CloseButton ariaLabel="Close" handleClick={handleDismiss} />
    </div>
  );
};

interface CoachMarkDescriptionProps {
  asChild?: boolean;
  children: ReactNode;
}

const CoachMarkDescription = (props: CoachMarkDescriptionProps) => {
  const { coachMarkId, setDescriptionId } = useCoachMarkContext();
  const id = `${coachMarkId}-description`;

  useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  if (props.asChild) {
    if (!isValidElement(props.children)) {
      throw Error(
        `When asChild is true, ${CoachMarkDescription.name}'s children must be a valid React element`
      );
    }
    return cloneElement(props.children as ReactElement<{ id: string }>, { id });
  }

  return (
    <p id={id} className="margin-top-0 font-sans-2xs">
      {props.children}
    </p>
  );
};

const Root = CoachMarkRoot;
const Portal = CoachMarkPortal;
const Heading = CoachMarkHeading;
const Description = CoachMarkDescription;

export { Description, Heading, Portal, Root };
