import { SelectedFile } from "../../custom/fileUploadUtils";

import { FileUploadPreview } from "./FileUploadPreview";

import styles from "./QuestionInput.module.css";

interface FileUploadPreviewContainerProps {
  onClose: (id: string) => void;
  files: SelectedFile[];
}

export const FileUploadPreviewContainer = ({ onClose, files }: FileUploadPreviewContainerProps) => {
  return (
    <div
      className={`display-flex flex-wrap margin-x-2 margin-bottom-05 ${styles.fileUploadPreviewsContainer}`}
    >
      {files.map((file) => (
        <FileUploadPreview onClose={onClose} fileId={file.fileId} fileName={file.name} />
      ))}
    </div>
  );
};
