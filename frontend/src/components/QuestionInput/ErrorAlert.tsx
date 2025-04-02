import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Alert } from "../../utils/alertUtils";
import {
  ERROR_ALERT_FADEOUT_DELAY_IN_SECONDS,
  ERROR_ALERT_TIMEOUT_PERIOD_IN_SECONDS,
} from "../../utils/alertUtils";
import { CloseButton } from "../common/Button";

import styles from "./QuestionInput.module.css";

interface ErrorAlertProps {
  onRemove: (id: string) => void;
  alert: Alert;
}

export const ErrorAlert = ({ onRemove, alert }: ErrorAlertProps) => {
  const [isFadeOutDelayed, setIsFadeOutDelayed] = useState(true);

  useEffect(() => {
    const fadeDelayTimer = setTimeout(() => {
      setIsFadeOutDelayed(false);
    }, 1000);

    return () => {
      clearTimeout(fadeDelayTimer);
    };
  }, [setIsFadeOutDelayed, alert.id]);

  return (
    <AnimatePresence onExitComplete={() => onRemove(alert.id)}>
      {isFadeOutDelayed && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: ERROR_ALERT_TIMEOUT_PERIOD_IN_SECONDS,
            delay: ERROR_ALERT_FADEOUT_DELAY_IN_SECONDS,
          }}
        >
          <div
            className={`usa-alert usa-alert--error usa-alert--slim margin-top-0 line-height-sans-5 width-full padding-y-0 position-relative display-flex flex-justify ${styles.errorAlert}`}
            data-testid={`errorAlert-${alert.id}`}
            role="alert"
          >
            <div className="usa-alert__body">
              <p className="usa-alert__text maxw-none" id={alert.id}>
                {alert.message}
              </p>
            </div>
            <CloseButton
              buttonClasses={`margin-right-1 ${styles.closeButton}`}
              ariaLabel={`Close error alert: ${alert.message}`}
              handleClick={() => {
                onRemove(alert.id);
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
