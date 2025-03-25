import type { UploadedFile } from "./fileUploadUtils";
import { ACCEPTED_FILE_TYPES, isImageFile, truncateFilename } from "./fileUploadUtils";

describe("Test the truncateFilename function", () => {
  it("correctly truncates file names that are over 20 characters long", () => {
    const fileName = "veryveryverylongname.jpg";
    const expectedTruncatedFileName = "veryveryv...gname.jpg";

    const result = truncateFilename(fileName);

    expect(result).toEqual(expectedTruncatedFileName);
  });

  it("does not truncate file names that are under 20 characters long", () => {
    const fileName = "shortname.jpg";
    const expectedTruncatedFileName = fileName;

    const result = truncateFilename(fileName);

    expect(result).toEqual(expectedTruncatedFileName);
  });
});

describe("Test the isImageFile function", () => {
  it.each([
    [ACCEPTED_FILE_TYPES.JPEG, true],
    [ACCEPTED_FILE_TYPES.PNG, true],
    [ACCEPTED_FILE_TYPES.GIF, true],
    [ACCEPTED_FILE_TYPES.BMP, true],
    [ACCEPTED_FILE_TYPES.TIFF, true],
    [ACCEPTED_FILE_TYPES.DOCX, false],
    [ACCEPTED_FILE_TYPES.CSV, false],
    [ACCEPTED_FILE_TYPES.PDF, false],
  ])(
    "correctly identifies if a file of type .%s is an image file",
    (fileType: string, expectedResult: boolean) => {
      const mockUploadedFile: UploadedFile = {
        name: "mockName",
        contents: "",
        size: 1,
        extension: fileType,
      };
      expect(isImageFile(mockUploadedFile)).toBe(expectedResult);
    }
  );
});
