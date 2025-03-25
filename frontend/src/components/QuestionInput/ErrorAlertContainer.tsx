import type { AlertsMap } from "../../utils/alertUtils";
import type { ErrorAlertType } from "../../utils/alertUtils";

import { ErrorAlert } from "./ErrorAlert";

import styles from "./QuestionInput.module.css";

interface AlertContainerProps {
  onRemove: (id: keyof typeof ErrorAlertType) => void;
  alerts: AlertsMap;
}

export const ErrorAlertContainer = ({ onRemove, alerts }: AlertContainerProps) => {
  return (
    <div
      className={`alertContainer display-flex flex-column width-full  ${styles.errorAlertContainer}`}
      data-testid="error-alert-container"
    >
      {Object.entries(alerts).map(([alertType, alertMessage]) => {
        if (alertMessage != null) {
          return (
            <ErrorAlert
              onRemove={onRemove}
              message={alertMessage}
              alertType={alertType as keyof typeof ErrorAlertType}
              key={alertType}
            />
          );
        }
      })}
    </div>
  );
};
