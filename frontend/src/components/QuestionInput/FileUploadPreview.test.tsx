import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { FileUploadPreview } from "./FileUploadPreview";
expect.extend(toHaveNoViolations);

describe("Test the FileUploadPreview component", () => {
  it("correctly renders a file upload preview", async () => {
    const fileName = "fileName.jpg";
    const fileId = "fileId";
    const { container } = render(
      <FileUploadPreview onClose={() => {}} fileId={fileId} fileName={fileName} />
    );

    const fileUploadPreview = screen.getByTestId(`filePreview-${fileId}`);
    expect(fileUploadPreview).toBeInTheDocument();

    const fileUploadPreviewTitle = within(fileUploadPreview).getByText(fileName);
    expect(fileUploadPreviewTitle).toBeInTheDocument();

    const fileUploadPreviewCloseButton = within(fileUploadPreview).getByRole("button");
    expect(fileUploadPreviewCloseButton).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows a file upload preview with a correctly abbreviated name when a file with a very long name is uploaded", async () => {
    const expectedFilename = "veryveryv...gname.jpg";

    const { container } = render(
      <FileUploadPreview
        onClose={() => {}}
        fileId={"fileId"}
        fileName={"veryveryverylongname.jpg"}
      />
    );

    expect(screen.queryByText(expectedFilename)).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test the onClose function", () => {
  it("calls the onClose function with the file upload preview ID when the close button is clicked", async () => {
    const mockOnClose = jest.fn();
    const fileName = "fileName.jpg";
    const fileId = "fileId";
    const { container } = render(
      <FileUploadPreview onClose={mockOnClose} fileId={fileId} fileName={fileName} />
    );

    const fileUploadPreview = screen.getByTestId(`filePreview-${fileId}`);
    expect(fileUploadPreview).toBeInTheDocument();

    const fileUploadPreviewCloseButton = within(fileUploadPreview).getByRole("button");
    expect(fileUploadPreviewCloseButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(fileUploadPreviewCloseButton);
    });

    expect(mockOnClose).toHaveBeenCalledWith(fileId);

    expect(await axe(container)).toHaveNoViolations();
  });
});
