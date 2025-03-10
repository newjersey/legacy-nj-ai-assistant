import { useEffect } from "react";
import icons from "@newjersey/njwds/dist/img/sprite.svg";

import { Alert, ERROR_ALERT_TIMEOUT_PERIOD_IN_MS } from "../../utils/alertUtils";

import styles from "./QuestionInput.module.css";

interface ErrorAlertProps {
  onRemove: (id: string) => void;
  alert: Alert;
}

export const ErrorAlert = ({ onRemove, alert }: ErrorAlertProps) => {
  useEffect(() => {
    const timeId = setTimeout(() => {
      onRemove(alert.id);
    }, ERROR_ALERT_TIMEOUT_PERIOD_IN_MS);

    return () => {
      clearTimeout(timeId);
    };
  });

  return (
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
      <button
        className={`usa-button usa-button--unstyled margin-right-1 ${styles.closeButton}`}
        aria-label="Close error alert"
        onClick={() => {
          onRemove(alert.id);
        }}
      >
        <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
          <use href={`${icons}#close`} />
        </svg>
      </button>
    </div>
  );
};
