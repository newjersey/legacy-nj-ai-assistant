import { SelectedFile } from "../custom/fileUploadUtils";

export const createMockFile = (
  extension: string,
  fileType: string,
  fileSizeInMb?: number
): File => {
  const blob = new Blob(["hello"], { type: fileType });
  const file = new File([blob], `default.${extension}`, { type: fileType });
  if (fileSizeInMb) {
    Object.defineProperty(file, "size", { value: 1024 * 1024 * fileSizeInMb });
  }

  return file;
};

export const createMockSelectedFiles = (files: File): SelectedFile => {
  return files.map();
};
