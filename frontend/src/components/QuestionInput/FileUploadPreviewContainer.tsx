import { FilePreview } from "../../utils/fileUploadUtils";

import { FileUploadPreview } from "./FileUploadPreview";

import styles from "./QuestionInput.module.css";

interface FileUploadPreviewContainerProps {
  onClose: (id: string) => void;
  files: FilePreview[];
}

export const FileUploadPreviewContainer = ({ onClose, files }: FileUploadPreviewContainerProps) => {
  return (
    <div
      className={`display-flex flex-wrap margin-x-2 margin-bottom-05 ${styles.fileUploadPreviewsContainer}`}
    >
      {files.map((file) => (
        <div key={file.fileId}>
          <FileUploadPreview
            onClose={onClose}
            fileId={file.fileId}
            fileName={file.name}
            key={file.fileId}
          />
        </div>
      ))}
    </div>
  );
};
