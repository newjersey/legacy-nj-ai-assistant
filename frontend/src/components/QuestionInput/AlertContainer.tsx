import type { Alert } from "../../utils/alertUtils";

import { ErrorAlert } from "./ErrorAlert";

import styles from "./QuestionInput.module.css";

interface AlertContainerProps {
  onRemove: (id: string) => void;
  alerts: Alert[];
}

export const AlertContainer = ({ onRemove, alerts }: AlertContainerProps) => {
  return (
    <div
      className={`alertContainer display-flex flex-column width-full  ${styles.errorAlertContainer}`}
    >
      {alerts.map((alert) => (
        <ErrorAlert onRemove={onRemove} alert={alert} key={alert.id} />
      ))}
    </div>
  );
};
