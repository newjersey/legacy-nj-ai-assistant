import {   
  MAX_UPLOADED_FILE_COUNT,
  MAX_UPLOADED_FILE_SIZE_IN_MB,
  MAX_UPLOADED_IMAGE_SIZE_IN_MB,truncateFilename } from "./fileUploadUtils";


export interface Alert {
  message: string;
  label?: string;
  id: string;
}

export const getImageExceedsMaxSizeErrors = (filenames: string[]): Alert[] => {
  const errors: Alert[] = [];

  if(filenames.length === 1) {
    errors.push ({
      `${truncateFilename(filenames[0])} exceeds ${MAX_UPLOADED_IMAGE_SIZE_IN_MB} MB and cannot be uploaded`
    })
  }
};
