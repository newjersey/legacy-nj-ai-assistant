import { useState, useEffect } from "react";
import styles from "./AlertBanner.module.css";
import { CloseButton } from "../common/Button";

export const AlertType = {
  INFO: "info",
  WARNING: "warning",
  SUCCESS: "success",
  ERROR: "error",
  EMERGENCY: "emergency",
} as const;

export type AlertType = (typeof AlertType)[keyof typeof AlertType];

interface Props {
  message: string;
  alertType: AlertType;
  dismissible?: boolean; 
  id: string; 
}

export const AlertBanner = (props: Props) => {
  const alertId = props.id || `alert-${props.alertType}`;
  const storageKey = `dismissed-alert-banner-${alertId}`;

  const [isVisible, setIsVisible] = useState(() => {
    try {
      return localStorage.getItem(storageKey) !== "true";
    } catch (e) {
      return true;
    }
  });

  const handleClose = () => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch (e) {
      return true;
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const canDismissBanner = props.dismissible === true;

  return (
    <div
      data-testid="alert-banner"
      className={`usa-alert usa-alert--${props.alertType} usa-alert--slim usa-alert--no-icon ${styles.alertBanner}`}
    >
      <div className={styles.alertBannerContent}>
        <p
          className={`${styles.alertBannerText} usa-alert__text`}
          dangerouslySetInnerHTML={{ __html: props.message }}
        />
        {canDismissBanner && (
          <CloseButton
            ariaLabel="Close alert banner"
            buttonClasses={styles.closeButton}
            handleClick={handleClose}
          />
        )}
      </div>
    </div>
  );
};
