import styles from "./QuestionInput.module.css";
import { Alert } from "../../custom/alertUtils";
import icons from "@newjersey/njwds/dist/img/sprite.svg";

interface AlertBannerProps {
  onClose: (id: string) => void;
  alert: Alert;
}

export const AlertBanner = ({ onClose, alert }: AlertBannerProps) => {
  return (
    <div
      className={`usa-alert usa-alert--error usa-alert--slim margin-top-0 line-height-sans-5 width-full padding-y-0 position-relative display-flex flex-justify ${styles.errorAlert}`}
      data-testId="errorAlert"
    >
      <div className="usa-alert__body">
        <p className="usa-alert__text maxw-none" id={alert.id}>
          {alert.message}
        </p>
      </div>
      <button
        className={`usa-button usa-button--unstyled margin-right-1 ${styles.closeButton}`}
        aria-label="Close error alert"
        onClick={() => onClose(alert.id)}
      >
        <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
          <use href={`${icons}#close`} />
        </svg>
      </button>
    </div>
  );
};
