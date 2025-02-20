import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { ACCEPTED_FILE_TYPES } from "../../custom/fileUploadUtils";
import { createMockFile } from "../../test/factories";

import { QuestionInput } from "./QuestionInput";
expect.extend(toHaveNoViolations);

async function uploadFiles(uploadedFiles: File[]) {
  const fileInput = screen.getByLabelText("Upload files");

  await fireEvent.change(fileInput, { target: { files: uploadedFiles } });
}

function inputChatMessage(message?: string) {
  const textInputField = screen.getByLabelText("Type a question");

  fireEvent.change(textInputField, {
    target: { value: message ?? "This is my message" },
  });
}

function submitChatMessage() {
  const submitButton = screen.getByLabelText("Ask question button");

  fireEvent.click(submitButton);
}

describe("Test uploading files", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ["jpg", ACCEPTED_FILE_TYPES.JPEG],
    ["png", ACCEPTED_FILE_TYPES.PNG],
    ["gif", ACCEPTED_FILE_TYPES.GIF],
    ["bmp", ACCEPTED_FILE_TYPES.BMP],
    ["tiff", ACCEPTED_FILE_TYPES.TIFF],
    ["docx", ACCEPTED_FILE_TYPES.DOCX],
    ["csv", ACCEPTED_FILE_TYPES.CSV],
    ["pdf", ACCEPTED_FILE_TYPES.PDF],
  ])(
    "uploads files with extension .%s without errors",
    async (extension: string, fileType: ACCEPTED_FILE_TYPES) => {
      const uploadedFile = createMockFile(extension, fileType);

      const { container } = render(
        <QuestionInput
          onSend={() => {}}
          disabled={false}
          placeholder={"placeholder"}
          conversationId={undefined}
          clearOnSend={false}
        />
      );

      await act(async () => {
        uploadFiles([uploadedFile]);
        inputChatMessage();
        submitChatMessage();
      });

      expect(await axe(container)).toHaveNoViolations();
    }
  );

  it("displays an error if the uploaded file is not of a valid filetype", async () => {
    const uploadedFile = createMockFile("fakeExtension", "invalid/filetype");

    const { container } = render(
      <QuestionInput
        onSend={() => {}}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      uploadFiles([uploadedFile]);
      inputChatMessage();
      submitChatMessage();
    });

    const inputError = screen.queryByText(/Only the following file types are supported/i);

    expect(inputError).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it.each([
    ["jpg", ACCEPTED_FILE_TYPES.JPEG],
    ["png", ACCEPTED_FILE_TYPES.PNG],
    ["gif", ACCEPTED_FILE_TYPES.GIF],
    ["bmp", ACCEPTED_FILE_TYPES.BMP],
    ["tiff", ACCEPTED_FILE_TYPES.TIFF],
  ])(
    "displays an error if an image file with extension .%s that exceeds the maximum upload size is added",
    async (extension: string, fileType: ACCEPTED_FILE_TYPES) => {
      const uploadedFile = createMockFile(extension, fileType, 11);

      const { container } = render(
        <QuestionInput
          onSend={() => {}}
          disabled={false}
          placeholder={"placeholder"}
          conversationId={undefined}
          clearOnSend={false}
        />
      );

      await act(async () => {
        uploadFiles([uploadedFile]);
      });

      const inputError = screen.queryByText(/exceeds 10MB and cannot be uploaded/i);

      expect(inputError).toBeInTheDocument();

      expect(await axe(container)).toHaveNoViolations();
    }
  );

  it.each([
    ["docx", ACCEPTED_FILE_TYPES.DOCX],
    ["csv", ACCEPTED_FILE_TYPES.CSV],
    ["pdf", ACCEPTED_FILE_TYPES.PDF],
  ])(
    "displays an error if a non-image file with extension .%s that exceeds the maximum upload size is added",
    async (extension: string, fileType: ACCEPTED_FILE_TYPES) => {
      const uploadedFile = createMockFile(extension, fileType, 51);

      const { container } = render(
        <QuestionInput
          onSend={() => {}}
          disabled={false}
          placeholder={"placeholder"}
          conversationId={undefined}
          clearOnSend={false}
        />
      );

      await act(async () => {
        uploadFiles([uploadedFile]);
      });

      const inputError = screen.queryByText(/exceeds 50MB and cannot be uploaded/i);

      expect(inputError).toBeInTheDocument();

      expect(await axe(container)).toHaveNoViolations();
    }
  );
});

describe("Test file upload previews", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("displays the file upload preview when a file is uploaded", async () => {
    const uploadedFile = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);

    const { container } = render(
      <QuestionInput
        onSend={() => {}}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      uploadFiles([uploadedFile]);
    });

    const fileUploadPreview = screen.getByTestId(`filePreview-${uploadedFile.name}`);
    expect(fileUploadPreview).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays multiple file upload previews when multiple files are uploaded", async () => {
    const uploadedFileOne = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);
    const uploadedFileTwo = createMockFile("png", ACCEPTED_FILE_TYPES.PNG);

    const { container } = render(
      <QuestionInput
        onSend={() => {}}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      uploadFiles([uploadedFileOne, uploadedFileTwo]);
    });

    const fileUploadPreviewOne = screen.getByTestId(`filePreview-${uploadedFileOne.name}`);
    expect(fileUploadPreviewOne).toBeInTheDocument();

    const fileUploadPreviewTwo = screen.getByTestId(`filePreview-${uploadedFileTwo.name}`);
    expect(fileUploadPreviewTwo).toBeInTheDocument();
  });

  it("removes the file upload preview when the close button is clicked", async () => {
    const uploadedFile = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);

    const { container } = render(
      <QuestionInput
        onSend={() => {}}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      uploadFiles([uploadedFile]);
    });

    const fileUploadPreview = screen.getByTestId(`filePreview-${uploadedFile.name}`);
    expect(fileUploadPreview).toBeInTheDocument();

    const fileUploadPreviewCloseButton = within(fileUploadPreview!).getByRole("button");
    expect(fileUploadPreviewCloseButton).toBeInTheDocument();

    fireEvent.click(fileUploadPreviewCloseButton);

    expect(fileUploadPreview).not.toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("removes the appropriate file upload preview when one of many previews is closed", async () => {
    const uploadedFileOne = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);
    const uploadedFileTwo = createMockFile("png", ACCEPTED_FILE_TYPES.PNG);

    const { container } = render(
      <QuestionInput
        onSend={() => {}}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      uploadFiles([uploadedFileOne, uploadedFileTwo]);
    });

    const fileUploadPreviewOne = screen.getByTestId(`filePreview-${uploadedFileOne.name}`);
    expect(fileUploadPreviewOne).toBeInTheDocument();

    const fileUploadPreviewTwo = screen.getByTestId(`filePreview-${uploadedFileTwo.name}`);
    expect(fileUploadPreviewTwo).toBeInTheDocument();

    const fileUploadPreviewOneCloseButton = within(fileUploadPreviewOne).getByRole("button");
    expect(fileUploadPreviewOneCloseButton).toBeInTheDocument();

    fireEvent.click(fileUploadPreviewOneCloseButton);

    const fileUploadPreviewOneAfter = screen.queryByTestId(`filePreview-${uploadedFileOne.name}`);
    expect(fileUploadPreviewOneAfter).not.toBeInTheDocument();

    const fileUploadPreviewTwoAfter = screen.queryByTestId(`filePreview-${uploadedFileTwo.name}`);
    expect(fileUploadPreviewTwoAfter).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test error alerts", () => {
  it("displays an error alert when there is an error uploading a file", async () => {
    const uploadedFile = createMockFile("fakeExtension", "invalid/filetype");

    const { container } = render(
      <QuestionInput
        onSend={() => {}}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      uploadFiles([uploadedFile]);
      inputChatMessage();
      submitChatMessage();
    });

    const inputError = screen.getByTestId("errorAlert");
    expect(inputError).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays multiple error alerts when there are errors uploading multiple files", async () => {
    const uploadedFileOne = createMockFile("fakeExtensionOne", "invalid/filetype");
    const uploadedFileTwo = createMockFile("fakeExtensionTwo", "invalid/filetype");
  });

  it("removes the error alert when the close button is clicked", async () => {
    const uploadedFile = createMockFile("fakeExtension", "invalid/filetype");

    const { container } = render(
      <QuestionInput
        onSend={() => {}}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      uploadFiles([uploadedFile]);
      inputChatMessage();
      submitChatMessage();
    });

    const inputError = screen.getByTestId("errorAlert");
    expect(inputError).toBeInTheDocument();

    const inputErrorCloseButton = within(inputError!).getByRole("button");
    expect(inputErrorCloseButton).toBeInTheDocument();

    fireEvent.click(inputErrorCloseButton);

    expect(inputError).not.toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });
});
