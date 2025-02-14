import icons from "@newjersey/njwds/dist/img/sprite.svg";
import { v4 as uuidv4 } from "uuid";

import styles from "./QuestionInput.module.css";

interface FileUploadPreviewProps {
  onClose: (id: string) => void;
  fileName: string;
}

export const FileUploadPreview = ({ onClose, fileName }: FileUploadPreviewProps) => {
  const formatFileName = (fileName: string) => {
    if (fileName.length < 20) {
      return fileName;
    }

    return `${fileName.substring(0, 9)}...${fileName.substring(fileName.length - 9)}`;
  };

  const fileId = uuidv4();

  return (
    <div
      className={`text-black flex-align-center padding-x-1 margin-right-105 margin-bottom-105 height-5 ${styles.fileUploadPreview}`}
      data-testid={fileId}
    >
      <svg className="usa-icon margin-right-05" aria-hidden="true" focusable="false" role="img">
        <use href={`${icons}#image`} />
      </svg>
      <p className={`margin-top-0 font-sans-3xs`}>{formatFileName(fileName)}</p>
      <button
        className={`usa-button usa-button--unstyled ${styles.closeButton}`}
        aria-label="Remove file upload"
        onClick={() => onClose(fileId)}
      >
        <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
          <use href={`${icons}#close`} />
        </svg>
      </button>
    </div>
  );
};
