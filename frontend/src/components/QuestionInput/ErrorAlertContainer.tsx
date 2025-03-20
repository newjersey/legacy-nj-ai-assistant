import type { AlertsMap } from "../../utils/alertUtils";
import type { AlertType } from "../../utils/alertUtils";

import { ErrorAlert } from "./ErrorAlert";

import styles from "./QuestionInput.module.css";

interface AlertContainerProps {
  onRemove: (id: keyof typeof AlertType) => void;
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
              alertType={alertType}
              key={alertType}
            />
          );
        }
      })}
    </div>
  );
};
