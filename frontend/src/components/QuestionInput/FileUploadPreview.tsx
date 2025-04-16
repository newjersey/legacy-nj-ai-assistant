import icons from "@newjersey/njwds/dist/img/sprite.svg";

import { truncateFilename } from "../../utils/fileUploadUtils";
import { CloseButton } from "../common/Button";

import styles from "./QuestionInput.module.css";

interface FileUploadPreviewProps {
  onClose: (id: string) => void;
  fileId: string;
  fileName: string;
}

export const FileUploadPreview = ({ onClose, fileId, fileName }: FileUploadPreviewProps) => {
  return (
    <div
      className={`text-black flex-align-center padding-x-1 margin-right-105 margin-bottom-105 height-5 ${styles.fileUploadPreview}`}
      id={fileId}
      title={fileName}
      data-testid={`filePreview-${fileId}`}
    >
      <svg
        className={`usa-icon margin-right-05 ${styles.filePreviewIcon}`}
        aria-hidden="true"
        focusable="false"
        role="img"
      >
        <use href={`${icons}#image`} />
      </svg>
      <p className={`margin-top-0 font-sans-3xs`}>{truncateFilename(fileName)}</p>
      <CloseButton
        ariaLabel={`Remove file upload: ${fileName}`}
        buttonClasses={`usa-button usa-button--unstyled ${styles.closeButton}`}
        handleClick={() => onClose(fileId)}
      />
    </div>
  );
};
