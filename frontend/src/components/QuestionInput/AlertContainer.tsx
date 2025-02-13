import { AlertBanner } from "./AlertBanner";
import { Alert } from "../../custom/alertUtils";

import styles from "./QuestionInput.module.css";

interface AlertContainerProps {
  onClose: (id: string) => void;
  alerts: Alert[];
}

export const AlertContainer = ({ onClose, alerts }: AlertContainerProps) => {
  return (
    <div
      className={`alertContainer display-flex flex-column position-absolute width-full  ${styles.errorAlertContainer}`}
    >
      {alerts.map((alert) => (
        <AlertBanner onClose={onClose} alert={alert} />
      ))}
    </div>
  );
};
