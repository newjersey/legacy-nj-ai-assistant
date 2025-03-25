import {
  MAX_UPLOADED_FILE_SIZE_IN_MB,
  MAX_UPLOADED_IMAGE_SIZE_IN_MB,
  truncateFilename,
} from "./fileUploadUtils";

export enum ErrorAlertType {
  IMAGE_EXCEEDS_MAX_SIZE = "image-exceeds-max-size",
  FILE_EXCEEDS_MAX_SIZE = "file-exceeds-max-size",
  PROMPT_NOT_ENTERED = "prompt-not-entered",
  EXCEEDED_FILE_CONTENT_CHARACTER_LIMIT = "exceeded-file-content-character-limit",
  EXCEEDED_PROMPT_CHARACTER_LIMIT = "exceeded-prompt-character-limit",
  FAILED_TO_READ_FILE = "failed-to-read-file",
  EXCEEDED_MAX_FILE_COUNT = "exceeded-max-file-count",
}

export const getFailedToReadFileErrorMessage = (filenames: string[]): string => {
  if (filenames.length === 1) {
    return `Could not read text from file: ${truncateFilename(filenames[0])}. Please try uploading a different file.`;
  } else {
    const filenamesString = filenames
      .map((fileName) => {
        return truncateFilename(fileName);
      })
      .join(", ");

    return `Could not read text from files: ${filenamesString}. Please try uploading different files.`;
  }
};

export const getImageExceedsMaxSizeErrorMessage = (filenames: string[]): string => {
  if (filenames.length === 1) {
    return `Image file ${truncateFilename(filenames[0])} exceeds ${MAX_UPLOADED_IMAGE_SIZE_IN_MB} MB and cannot be uploaded.`;
  } else {
    const filenamesString = filenames
      .map((fileName) => {
        return truncateFilename(fileName);
      })
      .join(", ");

    return `The following image files exceed ${MAX_UPLOADED_IMAGE_SIZE_IN_MB} MB and cannot be uploaded: ${filenamesString}.`;
  }
};

export const getFileExceedsMaxSizeErrorMessage = (filenames: string[]): string => {
  if (filenames.length === 1) {
    return `File ${truncateFilename(filenames[0])} exceeds ${MAX_UPLOADED_FILE_SIZE_IN_MB} MB and cannot be uploaded.`;
  } else {
    const filenamesString = filenames
      .map((fileName) => {
        return truncateFilename(fileName);
      })
      .join(", ");

    return `The following files exceed ${MAX_UPLOADED_FILE_SIZE_IN_MB} MB and cannot be uploaded: ${filenamesString}.`;
  }
};

export type AlertsMap = {
  [key in ErrorAlertType]?: string | null;
};

export const defaultAlertsMap: AlertsMap = Object.fromEntries(
  Object.values(ErrorAlertType).map((alertType) => [alertType, null])
);
