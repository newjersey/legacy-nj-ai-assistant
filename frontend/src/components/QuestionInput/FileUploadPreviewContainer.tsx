import { AnimatePresence, motion } from "framer-motion";

import type { FilePreview } from "../../utils/fileUploadUtils";

import { FileUploadPreview } from "./FileUploadPreview";

import styles from "./QuestionInput.module.css";

interface FileUploadPreviewContainerProps {
  onClose: (id: string) => void;
  files: FilePreview[];
}

export const FileUploadPreviewContainer = ({ onClose, files }: FileUploadPreviewContainerProps) => {
  return (
    <AnimatePresence>
      <div
        className={`display-flex flex-wrap margin-x-2 margin-bottom-05 ${styles.fileUploadPreviewsContainer}`}
      >
        {files.map((file) => (
          <motion.div
            key={file.fileId}
            layout
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FileUploadPreview
              key={file.fileId}
              onClose={onClose}
              fileId={file.fileId}
              fileName={file.name}
            />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};
