import { render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { FileUploadPreviewContainer } from "./FileUploadPreviewContainer";
expect.extend(toHaveNoViolations);

describe("Test the FileUploadPreview component", () => {
  it("correctly renders a file upload preview container containing one file preview", async () => {
    
    const { container } = render(
      <FileUploadPreview onClose={() => {}} fileId={"fileId"} fileName={fileName} />
    );

    const fileUploadPreview = screen.getByTestId(`filePreview-${fileName}`);
    expect(fileUploadPreview).toBeInTheDocument();

    const fileUploadPreviewTitle = within(fileUploadPreview).getByText(fileName);
    expect(fileUploadPreviewTitle).toBeInTheDocument();

    const fileUploadPreviewCloseButton = within(fileUploadPreview).getByRole("button");
    expect(fileUploadPreviewCloseButton).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("correctly renders a file upload preview container containing multiple file previews", async () => {
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
