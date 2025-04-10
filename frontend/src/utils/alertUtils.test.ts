import {
  getFailedToReadFileErrorMessage,
  getFileExceedsMaxSizeErrorMessage,
  getImageExceedsMaxSizeErrorMessage,
} from "./alertUtils";
import { MAX_UPLOADED_FILE_SIZE_IN_MB, MAX_UPLOADED_IMAGE_SIZE_IN_MB } from "./fileUploadUtils";

describe("Test the getFailedToReadFileErrorMessage function", () => {
  it("returns the expected error message when one filename is passed in", () => {
    const fileNames = ["emptyFile.csv"];
    const expectedErrorMessage = `Could not read text from file: ${fileNames[0]}. Please try uploading a different file.`;

    const result = getFailedToReadFileErrorMessage(fileNames);

    expect(result).toEqual(expectedErrorMessage);
  });

  it("returns the expected error message when multiple filenames are passed in", () => {
    const fileNames = ["emptyFile.csv", "emptyFile2.csv"];
    const expectedErrorMessage = `Could not read text from files: ${fileNames[0]}, ${fileNames[1]}. Please try uploading different files.`;

    const result = getFailedToReadFileErrorMessage(fileNames);

    expect(result).toEqual(expectedErrorMessage);
  });
});

describe("Test the getImageExceedsMaxSizeErrorMessage function", () => {
  it("returns the expected error message when one filename is passed in", () => {
    const fileNames = ["oversizeFile.jpg"];
    const expectedErrorMessage = `Image file ${fileNames[0]} exceeds ${MAX_UPLOADED_IMAGE_SIZE_IN_MB} MB and cannot be uploaded.`;

    const result = getImageExceedsMaxSizeErrorMessage(fileNames);

    expect(result).toEqual(expectedErrorMessage);
  });

  it("returns the expected error message when multiple filenames are passed in", () => {
    const fileNames = ["oversizeFile.jpg", "oversizeFile2.jpg"];
    const expectedErrorMessage = `The following image files exceed ${MAX_UPLOADED_IMAGE_SIZE_IN_MB} MB and cannot be uploaded: ${fileNames[0]}, ${fileNames[1]}.`;

    const result = getImageExceedsMaxSizeErrorMessage(fileNames);

    expect(result).toEqual(expectedErrorMessage);
  });
});

describe("Test the getFileExceedsMaxSizeErrorMessage function", () => {
  it("returns the expected error message when one filename is passed in", () => {
    const fileNames = ["oversizeFile.csv"];
    const expectedErrorMessage = `File ${fileNames[0]} exceeds ${MAX_UPLOADED_FILE_SIZE_IN_MB} MB and cannot be uploaded.`;

    const result = getFileExceedsMaxSizeErrorMessage(fileNames);

    expect(result).toEqual(expectedErrorMessage);
  });

  it("returns the expected error message when multiple filenames are passed in", () => {
    const fileNames = ["oversizeFile.csv", "oversizeFile2.csv"];
    const expectedErrorMessage = `The following files exceed ${MAX_UPLOADED_FILE_SIZE_IN_MB} MB and cannot be uploaded: ${fileNames[0]}, ${fileNames[1]}.`;

    const result = getFileExceedsMaxSizeErrorMessage(fileNames);

    expect(result).toEqual(expectedErrorMessage);
  });
});
