export const MAX_UPLOADED_FILE_SIZE_IN_MB = 50;
export const MAX_UPLOADED_IMAGE_SIZE_IN_MB = 10;
export const MAX_UPLOADED_FILE_COUNT = 10;

export enum ACCEPTED_FILE_TYPES {
  JPEG = "image/jpeg",
  PNG = "image/png",
  GIF = "image/gif",
  BMP = "image/bmp",
  TIFF = "image/tiff",
  PDF = "application/pdf",
  CSV = "text/csv",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLS = "application/vnd.ms-excel",
  XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

export interface UploadedFile {
  name: string;
  contents: string[];
  size: number;
  extension: string;
  sheets?: string[];
}

export interface SelectedFile extends File {
  fileId: string;
}

export interface FilePreview {
  name: string;
  fileId: string;
}

export const isImageFile = (file: UploadedFile): boolean => {
  return file.extension.includes("image");
};

export const isSpreadsheetFile = (file: UploadedFile): boolean => {
  return (
    file.extension === ACCEPTED_FILE_TYPES.XLS ||
    file.extension === ACCEPTED_FILE_TYPES.XLSX ||
    file.extension === ACCEPTED_FILE_TYPES.CSV
  );
};

export const truncateFilename = (fileName: string) => {
  if (fileName.length < 20) {
    return fileName;
  }

  return `${fileName.substring(0, 9)}...${fileName.substring(fileName.length - 9)}`;
};
