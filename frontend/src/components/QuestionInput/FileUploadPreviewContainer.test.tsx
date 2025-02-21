import { render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { FilePreview } from "../../utils/fileUploadUtils";

import { FileUploadPreviewContainer } from "./FileUploadPreviewContainer";
expect.extend(toHaveNoViolations);

const createMockFilePreviews = (number: number): FilePreview[] => {
  const filePreviews: FilePreview[] = [];

  for (let i = 0; i < number; i++) {
    filePreviews.push({
      name: `filename-${i}`,
      fileId: `fileId-${i}`,
    });
  }

  return filePreviews;
};

describe("Test the FileUploadPreview component", () => {
  it("correctly renders a file upload preview container containing one file preview", async () => {
    const mockFilePreviews = createMockFilePreviews(1);

    const { container } = render(
      <FileUploadPreviewContainer onClose={() => {}} files={mockFilePreviews} />
    );

    const fileUploadPreview = screen.getByTestId(`filePreview-${mockFilePreviews[0].fileId}`);
    expect(fileUploadPreview).toBeInTheDocument();

    const fileUploadPreviewTitle = within(fileUploadPreview).getByText(mockFilePreviews[0].name);
    expect(fileUploadPreviewTitle).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("correctly renders a file upload preview container containing multiple file previews", async () => {
    const mockFilePreviews = createMockFilePreviews(3);

    const { container } = render(
      <FileUploadPreviewContainer onClose={() => {}} files={mockFilePreviews} />
    );

    mockFilePreviews.forEach((file) => {
      const fileUploadPreview = screen.getByTestId(`filePreview-${file.fileId}`);
      expect(fileUploadPreview).toBeInTheDocument();

      const fileUploadPreviewTitle = within(fileUploadPreview).getByText(file.name);
      expect(fileUploadPreviewTitle).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
