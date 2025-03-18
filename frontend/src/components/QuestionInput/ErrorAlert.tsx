import icons from "@newjersey/njwds/dist/img/sprite.svg";

import styles from "./QuestionInput.module.css";

interface ErrorAlertProps {
  onRemove: (id: string) => void;
  message: string;
  alertType: string;
}

export const ErrorAlert = ({ onRemove, message, alertType }: ErrorAlertProps) => {
  const formattedAlertType = alertType.replace("-", " ");

  return (
    <div
      className={`usa-alert usa-alert--error usa-alert--slim margin-top-0 line-height-sans-5 width-full padding-y-0 position-relative display-flex flex-justify ${styles.errorAlert}`}
      data-testid={`${alertType}`}
    >
      <div className="usa-alert__body">
        <p role="alert" className="usa-alert__text maxw-none" id={alertType}>
          {message}
        </p>
      </div>
      <button
        className={`usa-button usa-button--unstyled margin-right-1 ${styles.closeButton}`}
        aria-label={`Close error alert: ${formattedAlertType}`}
        onClick={() => {
          onRemove(alertType);
        }}
      >
        <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
          <use href={`${icons}#close`} />
        </svg>
      </button>
    </div>
  );
};
