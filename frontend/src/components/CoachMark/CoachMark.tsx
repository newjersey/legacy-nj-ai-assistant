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
  autoPlacement,
  autoUpdate,
  FloatingArrow,
  FloatingFocusManager,
  FloatingOverlay,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";

import { AppStateContext } from "../../state/AppProvider";
import {
  clearOldHideCoachMarkStorageKeys,
  DISABLE_COACH_MARKS_FOR_TEST_STORAGE_KEY,
  getHideCoachMarkStorageKey,
} from "../../utils/coachMarkUtils";
import { logEvent } from "../../utils/logEvent";
import { CloseButton } from "../common/Button";

import styles from "./CoachMark.module.css";

const ARROW_HEIGHT = 7;
const GAP = 8;

const setHideCoachMarkStorageItem = (id: string) => {
  localStorage.setItem(getHideCoachMarkStorageKey(id), JSON.stringify(true));
};

const isValidExpirationDate = (expirationIsoDate?: string): expirationIsoDate is string => {
  if (expirationIsoDate == undefined) {
    return false;
  }
  const expirationDateObj = new Date(expirationIsoDate);

  if (Number.isNaN(expirationDateObj.valueOf())) {
    return false;
  }
  return true;
};

const isPastExpirationDate = (expirationDateAsIsoString?: string) => {
  if (!isValidExpirationDate(expirationDateAsIsoString)) {
    return true;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expirationDate = new Date(expirationDateAsIsoString);
  expirationDate.setHours(0, 0, 0, 0);
  return today > expirationDate;
};

export interface CoachMarkOptions {
  id: string;
  referenceRef: RefObject<HTMLElement>;
  coachMarkPortal: ReactElement;
}

export const useCoachMark = (options: CoachMarkOptions) => {
  if (options.coachMarkPortal.type !== CoachMarkPortal) {
    throw Error("useCoachMark's coachMarkPortal option must be a <CoachMark.Portal> component!");
  }
  clearOldHideCoachMarkStorageKeys(options.id);

  const appStateContext = useContext(AppStateContext);
  const ui = appStateContext?.state.frontendSettings?.ui;
  const [isOpen, setIsOpen] = useState(false);

  const [coachMark, setCoachMark] = useState<HTMLElement | null>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();

  useEffect(() => {
    const hideCoachMarkStorageKey = getHideCoachMarkStorageKey(options.id);
    const isDismissed = localStorage.getItem(hideCoachMarkStorageKey) != null;

    const disableCoachMarksStorageValue = localStorage.getItem(
      DISABLE_COACH_MARKS_FOR_TEST_STORAGE_KEY
    );
    const isDisabled =
      disableCoachMarksStorageValue != null && JSON.parse(disableCoachMarksStorageValue) !== false;

    const isExpired = isPastExpirationDate(ui?.coach_mark_expiration_date_iso);
    const isExpirationDateValid = isValidExpirationDate(ui?.coach_mark_expiration_date_iso);
    if (isExpired && isExpirationDateValid) {
      localStorage.removeItem(hideCoachMarkStorageKey);
    }

    setIsOpen(!(isExpired || isDismissed || isDisabled));
  }, [ui?.coach_mark_expiration_date_iso, options.id]);

  useEffect(() => {
    if (options.referenceRef.current != null) {
      setReferenceElement(options.referenceRef.current);
    }
  }, [options.referenceRef]);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    setHideCoachMarkStorageItem(options.id);
    referenceElement?.classList.remove("coachMarkActive");
    logEvent("coach_mark_single_feat_dimiss", {
      object_id: options.id,
    });
  }, [options.id, referenceElement?.classList]);

  const floatingRootContext = useFloatingRootContext({
    open: isOpen,
    onOpenChange(nextOpen) {
      if (isOpen && nextOpen === false) {
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

  const click = useClick(floatingRootContext, { enabled: false });
  const dismiss = useDismiss(floatingRootContext, { referencePress: true, outsidePress: false });
  const interactions = useInteractions([dismiss, click]);

  return useMemo(
    () => ({
      referenceElement,
      setCoachMark,
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
      referenceElement,
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
      <div data-testid="coach-mark" />
      {props.coachMark.coachMarkPortal}
      {props.children}
    </CoachMarkContext.Provider>
  );
};

interface CoachMarkPortalProps {
  allowedPlacements: Placement[];
  children: ReactNode;
}

const CoachMarkPortal = (props: CoachMarkPortalProps) => {
  const coachMarkContext = useCoachMarkContext();

  useEffect(() => {
    if (coachMarkContext.referenceElement !== null) {
      coachMarkContext.referenceElement.classList.add("coachMarkActive");
    }
  }, [coachMarkContext.referenceElement]);

  const arrowRef = useRef(null);

  const { floatingStyles, context } = useFloating({
    rootContext: coachMarkContext,
    whileElementsMounted: autoUpdate,
    middleware: [
      autoPlacement({ allowedPlacements: props.allowedPlacements }),
      shift(),
      offset({
        mainAxis: ARROW_HEIGHT + GAP,
      }),
      arrow({ element: arrowRef }),
    ],
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
          className={`flex padding-2 bg-primary-lightest radius-lg shadow-2 max-mobile-lg ${styles.coachMarkDialog}`}
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
          <FloatingArrow ref={arrowRef} className={styles.coachMarkArrow} context={context} />
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
    <div className={`display-flex ${styles["flex-row-reverse"]} flex-justify flex-align-center`}>
      <CloseButton ariaLabel="Close" handleClick={handleDismiss} />
      <h1 id={id} className="margin-0 font-sans-md">
        {props.children}
      </h1>
    </div>
  );
};

interface CoachMarkDescriptionProps {
  children: ReactNode;
}

const CoachMarkDescription = (props: CoachMarkDescriptionProps) => {
  const { coachMarkId, setDescriptionId } = useCoachMarkContext();
  const id = `${coachMarkId}-description`;

  useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  if (!isValidElement(props.children)) {
    throw Error(`${CoachMarkDescription.name}'s children must be a valid React element`);
  }
  return cloneElement(props.children as ReactElement<{ id: string }>, { id });
};

const Root = CoachMarkRoot;
const Portal = CoachMarkPortal;
const Heading = CoachMarkHeading;
const Description = CoachMarkDescription;

export { Description, Heading, Portal, Root };
