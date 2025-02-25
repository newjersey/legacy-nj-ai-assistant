import { Alert } from "../../utils/alertUtils";

import { AlertBanner } from "./AlertBanner";

import styles from "./QuestionInput.module.css";

interface AlertContainerProps {
  onClose: (id: string) => void;
  alerts: Alert[];
}

export const AlertContainer = ({ onClose, alerts }: AlertContainerProps) => {
  return (
    <div
      className={`alertContainer display-flex flex-column width-full  ${styles.errorAlertContainer}`}
    >
      {alerts.map((alert) => (
        <div key={alert.id}>
          <AlertBanner onClose={onClose} alert={alert} />
        </div>
      ))}
    </div>
  );
};
