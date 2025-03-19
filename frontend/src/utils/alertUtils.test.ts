import {
  getFileExceedsMaxSizeErrorMessage,
  getImageExceedsMaxSizeErrorMessage,
} from "./alertUtils";
import { MAX_UPLOADED_FILE_SIZE_IN_MB, MAX_UPLOADED_IMAGE_SIZE_IN_MB } from "./fileUploadUtils";

describe("Test the getImageExceedsMaxSizeErrorMessage function", () => {
  it("returns the expected error message when one filename is passed in", () => {
    const fileNames = ["oversizeFile.jpg"];
    const expectedErrorMessage = `Image file ${fileNames[0]} exceeds ${MAX_UPLOADED_IMAGE_SIZE_IN_MB} MB and cannot be uploaded`;

    const result = getImageExceedsMaxSizeErrorMessage(fileNames);

    expect(result).toEqual(expectedErrorMessage);
  });

  it("returns the expected error message when multiple filenames are passed in", () => {
    const fileNames = ["oversizeFile.jpg", "oversizeFile2.jpg"];
    const expectedErrorMessage = `The following image files exceed ${MAX_UPLOADED_IMAGE_SIZE_IN_MB} MB and cannot be uploaded: ${fileNames[0]}, ${fileNames[1]}`;

    const result = getImageExceedsMaxSizeErrorMessage(fileNames);

    expect(result).toEqual(expectedErrorMessage);
  });
});

describe("Test the getFileExceedsMaxSizeErrorMessage function", () => {
  it("returns the expected error message when one filename is passed in", () => {
    const fileNames = ["oversizeFile.csv"];
    const expectedErrorMessage = `File ${fileNames[0]} exceeds ${MAX_UPLOADED_FILE_SIZE_IN_MB} MB and cannot be uploaded`;

    const result = getFileExceedsMaxSizeErrorMessage(fileNames);

    expect(result).toEqual(expectedErrorMessage);
  });

  it("returns the expected error message when multiple filenames are passed in", () => {
    const fileNames = ["oversizeFile.csv", "oversizeFile2.csv"];
    const expectedErrorMessage = `The following files exceed ${MAX_UPLOADED_FILE_SIZE_IN_MB} MB and cannot be uploaded: ${fileNames[0]}, ${fileNames[1]}`;

    const result = getFileExceedsMaxSizeErrorMessage(fileNames);

    expect(result).toEqual(expectedErrorMessage);
  });
});
