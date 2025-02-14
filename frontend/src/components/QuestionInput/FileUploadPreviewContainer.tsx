import { SelectedFile } from "../../custom/fileUploadUtils";
import { FileUploadPreview } from "./FileUploadPreview";

import styles from "./QuestionInput.module.css";

interface FileUploadPreviewContainerProps {
  onClose: (id: string) => void;
  selectedFiles: SelectedFile[];
}

export const FileUploadPreviewContainer = ({ onClose, selectedFiles }: FileUploadPreviewContainerProps) => {
  return (
    <div
      className={`display-flex flex-wrap margin-x-2 margin-bottom-05 ${styles.fileUploadPreviewsContainer}`}
    >
      {selectedFiles.map((selectedFile) => (
        <FileUploadPreview onClose={onClose} fileId={selectedFile.fileId} fileName={selectedFile.file.name} />
      ))}
    </div>
  );
};
