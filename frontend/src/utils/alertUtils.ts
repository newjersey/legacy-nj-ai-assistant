import {
  MAX_UPLOADED_FILE_SIZE_IN_MB,
  MAX_UPLOADED_IMAGE_SIZE_IN_MB,
  truncateFilename,
} from "./fileUploadUtils";

export enum AlertTypes {
  IMAGE_EXCEEDS_MAX_SIZE = "image-exceeds-max-size",
  FILE_EXCEEDS_MAX_SIZE = "file-exceeds-max-size",
  PROMPT_NOT_ENTERED = "prompt-not-entered",
  EXCEEDED_FILE_CONTENT_CHARACTER_LIMIT = "exceeded-file-content-character-limit",
  EXCEEDED_PROMPT_CHARACTER_LIMIT = "exceeded-prompt-character-limit",
  FAILED_TO_READ_PDF = "failed-to-read-PDF",
  FAILED_TO_READ_DOCX = "failed-to-read-docx",
  EXCEEDED_MAX_FILE_COUNT = "exceeded-max-file-count",
}

export const getImageExceedsMaxSizeErrorMessage = (filenames: string[]): string => {
  if (filenames.length === 1) {
    return `Image file ${truncateFilename(filenames[0])} exceeds ${MAX_UPLOADED_IMAGE_SIZE_IN_MB} MB and cannot be uploaded`;
  } else {
    const filenamesString = filenames
      .map((fileName) => {
        return truncateFilename(fileName);
      })
      .join(", ");

    return `The following image files exceed ${MAX_UPLOADED_IMAGE_SIZE_IN_MB} MB and cannot be uploaded: ${filenamesString}`;
  }
};

export const getFileExceedsMaxSizeErrorMessage = (filenames: string[]): string => {
  if (filenames.length === 1) {
    return `File ${truncateFilename(filenames[0])} exceeds ${MAX_UPLOADED_FILE_SIZE_IN_MB} MB and cannot be uploaded`;
  } else {
    const filenamesString = filenames
      .map((fileName) => {
        return truncateFilename(fileName);
      })
      .join(", ");

    return `The following files exceed ${MAX_UPLOADED_FILE_SIZE_IN_MB} MB and cannot be uploaded: ${filenamesString}`;
  }
};

export type AlertsMap = {
  [key in AlertTypes]?: string | null;
};

export const defaultAlertsMap: AlertsMap = Object.fromEntries(
  Object.values(AlertTypes).map((alertType) => [alertType, null])
);
