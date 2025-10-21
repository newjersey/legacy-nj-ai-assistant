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
  id?: string; // Unique identifier for this alert type
}

export const AlertBanner = (props: Props) => {
  const alertId = props.id || `alert-${props.alertType}`;
  const storageKey = `dismissed-alert-${alertId}`;

  // Check localStorage on initial render
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return localStorage.getItem(storageKey) !== "true";
    } catch (e) {
      // In case localStorage is not available
      return true;
    }
  });

  const handleClose = () => {
    try {
      // Store the dismissal in localStorage
      localStorage.setItem(storageKey, "true");
    } catch (e) {
      // Handle localStorage errors silently
      console.error("Failed to save alert preference:", e);
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-testid="alert-banner"
      className={`usa-alert usa-alert--${props.alertType} usa-alert--slim usa-alert--no-icon`}
    >
      <div className={styles.alertBannerContent}>
        <p
          className={`${styles.alertBannerText} usa-alert__text`}
          dangerouslySetInnerHTML={{ __html: props.message }}
        />
        <CloseButton
          ariaLabel="Close alert banner"
          buttonClasses={styles.closeButton}
          handleClick={handleClose}
        />
      </div>
    </div>
  );
};
