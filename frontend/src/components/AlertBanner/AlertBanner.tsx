import styles from "./AlertBanner.module.css";

export const ALERT_TYPES = ["info", "warning", "success", "error", "emergency"] as const;

type AlertType = (typeof ALERT_TYPES)[number];

interface Props {
  message: string;
  alertType?: AlertType;
}

export const AlertBanner = (props: Props) => {
  const alertType: AlertType = props.alertType ?? "info";

  return (
    <div
      data-testid="alert-banner"
      className={`usa-alert usa-alert--${alertType} usa-alert--slim usa-alert--no-icon`}
    >
      <div className="usa-alert__body">
        <p className={`${styles.alertBannerText} usa-alert__text`}>{props.message}</p>
      </div>
    </div>
  );
};
