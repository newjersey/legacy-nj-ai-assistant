import type { IButtonProps } from "@fluentui/react";
import { CommandBarButton, DefaultButton } from "@fluentui/react";
import icons from "@newjersey/njwds/dist/img/sprite.svg";

import styles from "./Button.module.css";

interface ButtonProps extends IButtonProps {
  onClick: () => void;
  text: string | undefined;
}

export const ShareButton: React.FC<ButtonProps> = ({ onClick, text }) => {
  return (
    <CommandBarButton
      className={styles.shareButtonRoot}
      iconProps={{ iconName: "Share" }}
      onClick={onClick}
      text={text}
    />
  );
};

export const HistoryButton: React.FC<ButtonProps> = ({ onClick, text }) => {
  return (
    <DefaultButton
      className={styles.historyButtonRoot}
      text={text}
      iconProps={{ iconName: "History" }}
      onClick={onClick}
    />
  );
};

interface CloseButtonProps {
  ariaLabel: string;
  buttonClasses?: string;
  handleClick: () => void;
}
export const CloseButton = (props: CloseButtonProps) => {
  return (
    <button
      className={`usa-button usa-button--unstyled ${props.buttonClasses ?? ""}`}
      onClick={props.handleClick}
      aria-label={props.ariaLabel}
    >
      <svg className="usa-icon text-ink" aria-hidden="true" focusable="false" role="img">
        <use href={`${icons}#close`}></use>
      </svg>
    </button>
  );
};
