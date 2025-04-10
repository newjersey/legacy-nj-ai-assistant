import type { ErrorAlertType } from "../../utils/alertUtils";
import { CloseButton } from "../common/Button";

import styles from "./QuestionInput.module.css";

interface ErrorAlertProps {
  onRemove: (id: keyof typeof ErrorAlertType) => void;
  message: string;
  alertType: string;
}

export const ErrorAlert = ({ onRemove, message, alertType }: ErrorAlertProps) => {
  const formattedAlertType = alertType.replaceAll("-", " ");

  return (
    <div
      className={`usa-alert usa-alert--error usa-alert--slim margin-top-0 line-height-sans-5 width-full padding-y-0 position-relative display-flex flex-align-center flex-justify ${styles.errorAlert}`}
      data-testid={`${alertType}`}
    >
      <div className={`usa-alert__body ${styles.errorAlertText}`}>
        <p role="alert" className="usa-alert__text maxw-none" id={alertType}>
          {message}
        </p>
      </div>
      <CloseButton
        buttonClasses={`usa-button usa-button--unstyled height-auto margin-right-1 ${styles.closeButton}`}
        ariaLabel={`Close error alert: ${formattedAlertType}`}
        handleClick={() => {
          onRemove(alertType as keyof typeof ErrorAlertType);
        }}
      />
    </div>
  );
};
