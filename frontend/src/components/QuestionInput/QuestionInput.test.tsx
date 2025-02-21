import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { ACCEPTED_FILE_TYPES, UploadedFile } from "../../utils/fileUploadUtils";
import { createMockFile } from "../../test/factories";

const uuidv4Mock = jest.fn();

jest.mock("uuid", () => ({
  v4: uuidv4Mock,
}));

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

function clickSubmitButton() {
  const submitButton = screen.getByLabelText("Ask question button");

  fireEvent.click(submitButton);
}

describe("Test the QuestionInput component", () => {
  it("correctly renders the QuestionInput component without any axe violations", async () => {
    const { container } = render(
      <QuestionInput
        onSend={() => {}}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test file upload previews", () => {
  const defaultMockUuid = "defaultMockUuid";

  beforeEach(() => {
    uuidv4Mock.mockImplementation(() => {
      return defaultMockUuid;
    });
  });

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

    const fileUploadPreview = screen.getByTestId(`filePreview-${defaultMockUuid}`);
    expect(fileUploadPreview).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays multiple file upload previews when multiple files are uploaded", async () => {
    const uploadedFileOne = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);
    const mockUuidOne = "mockUuidOne";
    const uploadedFileTwo = createMockFile("png", ACCEPTED_FILE_TYPES.PNG);
    const mockUuidTwo = "mockUuidTwo";

    uuidv4Mock
      .mockImplementationOnce(() => {
        return mockUuidOne;
      })
      .mockImplementationOnce(() => {
        return mockUuidTwo;
      });

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

    const fileUploadPreviewOne = screen.getByTestId(`filePreview-${mockUuidOne}`);
    expect(fileUploadPreviewOne).toBeInTheDocument();

    const fileUploadPreviewTwo = screen.getByTestId(`filePreview-${mockUuidTwo}`);
    expect(fileUploadPreviewTwo).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
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

    const fileUploadPreview = screen.getByTestId(`filePreview-${defaultMockUuid}`);
    expect(fileUploadPreview).toBeInTheDocument();

    const fileUploadPreviewCloseButton = within(fileUploadPreview!).getByRole("button");
    expect(fileUploadPreviewCloseButton).toBeInTheDocument();

    fireEvent.click(fileUploadPreviewCloseButton);

    expect(fileUploadPreview).not.toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("removes the appropriate file upload preview when one of many previews is closed", async () => {
    const uploadedFileOne = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);
    const mockUuidOne = "mockUuidOne";
    const uploadedFileTwo = createMockFile("png", ACCEPTED_FILE_TYPES.PNG);
    const mockUuidTwo = "mockUuidTwo";

    uuidv4Mock
      .mockImplementationOnce(() => {
        return mockUuidOne;
      })
      .mockImplementationOnce(() => {
        return mockUuidTwo;
      });

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

    const fileUploadPreviewOne = screen.getByTestId(`filePreview-${mockUuidOne}`);
    expect(fileUploadPreviewOne).toBeInTheDocument();

    const fileUploadPreviewTwo = screen.getByTestId(`filePreview-${mockUuidTwo}`);
    expect(fileUploadPreviewTwo).toBeInTheDocument();

    const fileUploadPreviewOneCloseButton = within(fileUploadPreviewOne).getByRole("button");
    expect(fileUploadPreviewOneCloseButton).toBeInTheDocument();

    fireEvent.click(fileUploadPreviewOneCloseButton);

    const fileUploadPreviewOneAfter = screen.queryByTestId(`filePreview-${mockUuidOne}`);
    expect(fileUploadPreviewOneAfter).not.toBeInTheDocument();

    const fileUploadPreviewTwoAfter = screen.queryByTestId(`filePreview-${mockUuidTwo}`);
    expect(fileUploadPreviewTwoAfter).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test error alerts", () => {
  const defaultMockUuid = "defaultMockUuid";

  beforeEach(() => {
    uuidv4Mock.mockImplementation(() => {
      return defaultMockUuid;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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
    });

    const inputError = screen.getByTestId(`errorAlert-invalidFiletype-${defaultMockUuid}`);
    expect(inputError).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
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
    });

    const inputError = screen.getByTestId(`errorAlert-invalidFiletype-${defaultMockUuid}`);
    expect(inputError).toBeInTheDocument();

    const inputErrorCloseButton = within(inputError!).getByRole("button");
    expect(inputErrorCloseButton).toBeInTheDocument();

    fireEvent.click(inputErrorCloseButton);

    const inputErrorAfter = screen.queryByTestId(`errorAlert-invalidFiletype-${defaultMockUuid}`);
    expect(inputErrorAfter).not.toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays multiple error alerts when there are multiple errors uploading files", async () => {
    const uploadedFileOne = createMockFile("png", ACCEPTED_FILE_TYPES.PNG, 100);
    const mockUuidOne = "mockUuidOne";
    const uploadedFileTwo = createMockFile("pdf", ACCEPTED_FILE_TYPES.PDF, 100);
    const mockUuidTwo = "mockUuidTwo";

    uuidv4Mock
      .mockImplementationOnce(() => {
        return mockUuidOne;
      })
      .mockImplementationOnce(() => {
        return mockUuidTwo;
      });

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

    const inputErrorOne = screen.getByTestId(`errorAlert-exceedsMaxSize-${mockUuidOne}`);
    expect(inputErrorOne).toBeInTheDocument();
    const inputErrorTwo = screen.getByTestId(`errorAlert-exceedsMaxSize-${mockUuidTwo}`);
    expect(inputErrorTwo).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("removes the appropriate error alert when one of many alerts is closed", async () => {
    const uploadedFileOne = createMockFile("png", ACCEPTED_FILE_TYPES.PNG, 100);
    const mockUuidOne = "mockUuidOne";
    const uploadedFileTwo = createMockFile("pdf", ACCEPTED_FILE_TYPES.PDF, 100);
    const mockUuidTwo = "mockUuidTwo";

    uuidv4Mock
      .mockImplementationOnce(() => {
        return mockUuidOne;
      })
      .mockImplementationOnce(() => {
        return mockUuidTwo;
      });

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

    const inputErrorOne = screen.getByTestId(`errorAlert-exceedsMaxSize-${mockUuidOne}`);
    expect(inputErrorOne).toBeInTheDocument();
    const inputErrorTwo = screen.getByTestId(`errorAlert-exceedsMaxSize-${mockUuidTwo}`);
    expect(inputErrorTwo).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();

    const inputErrorOneCloseButton = within(inputErrorOne).getByRole("button");
    expect(inputErrorOneCloseButton).toBeInTheDocument();

    fireEvent.click(inputErrorOneCloseButton);

    const inputErrorOneAfter = screen.queryByTestId(`errorAlert-exceedsMaxSize-${mockUuidOne}`);
    expect(inputErrorOneAfter).not.toBeInTheDocument();

    const inputErrorTwoAfter = screen.queryByTestId(`errorAlert-exceedsMaxSize-${mockUuidTwo}`);
    expect(inputErrorTwoAfter).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays the appropriate input error if the uploaded file is not of a valid filetype", async () => {
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
    "displays the appropriate input error if an image file with extension .%s that exceeds the maximum upload size is added",
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
    "displays the appropriate input error if a non-image file with extension .%s that exceeds the maximum upload size is added",
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

  it("displays the appropriate input error if the total file contents are too long", async () => {
    const uploadedFile = createMockFile("csv", ACCEPTED_FILE_TYPES.CSV, 8, "a".repeat(1048576 + 1));

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
      clickSubmitButton();
    });

    await waitFor(() => {
      expect(screen.getByText(/Please try a smaller file./)).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays the appropriate input error if the prompt length is too long", async () => {
    const prompt = "a".repeat(1048576 + 1);

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
      inputChatMessage(prompt);
      clickSubmitButton();
    });

    const inputError = screen.queryByText(/Please try a smaller prompt./);
    expect(inputError).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays the appropriate input error if text cannot be read from a .pdf file", async () => {
    const uploadedPdfFile = createMockFile("pdf", ACCEPTED_FILE_TYPES.PDF, 8, "");

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
      uploadFiles([uploadedPdfFile]);
      inputChatMessage();
      clickSubmitButton();
    });

    await waitFor(() => {
      expect(screen.getByText(/Could not read text from PDF:/)).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays the appropriate input error if text cannot be read from a .docx file", async () => {
    const uploadedDocxFile = createMockFile("docx", ACCEPTED_FILE_TYPES.DOCX, 8, "");

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
      uploadFiles([uploadedDocxFile]);
      inputChatMessage();
      clickSubmitButton();
    });

    await waitFor(() => {
      expect(screen.getByText(/Could not read text from .docx file:/)).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays the appropriate input error if more than 10 files are uploaded", async () => {
    const mockFilesToUpload = Array.from({ length: 15 }, (_, _i) => {
      return createMockFile("png", ACCEPTED_FILE_TYPES.PNG);
    });

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
      uploadFiles(mockFilesToUpload);
    });

    const inputError = screen.queryByText(/A maximum of 10 files can be uploaded/);
    expect(inputError).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });
});

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
      });

      expect(await axe(container)).toHaveNoViolations();
    }
  );

  it("will display an error but upload other files if one file uploaded in a batch causes errors", async () => {
    const invalidUploadedFile = createMockFile("png", ACCEPTED_FILE_TYPES.PNG, 100);
    const mockInvalidFileUuid = "invalidFileUuid";
    const validUploadedFile = createMockFile("png", ACCEPTED_FILE_TYPES.PNG);
    const mockValidFileUuid = "validFileUuid";

    uuidv4Mock
      .mockImplementationOnce(() => {
        return mockInvalidFileUuid;
      })
      .mockImplementationOnce(() => {
        return mockValidFileUuid;
      });

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
      uploadFiles([invalidUploadedFile, validUploadedFile]);
    });

    const inputError = screen.getByTestId(`errorAlert-exceedsMaxSize-${mockInvalidFileUuid}`);
    expect(inputError).toBeInTheDocument();

    const validFileUploadPreview = screen.getByTestId(`filePreview-${mockValidFileUuid}`);
    expect(validFileUploadPreview).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test sending input", () => {
  it("sends input with just the prompt question when the enter button is pressed while the text area is selected", async () => {
    const mockOnSend = jest.fn();
    const expectedText = "hello!!";

    const { container } = render(
      <QuestionInput
        onSend={mockOnSend}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    const textArea = screen.getByLabelText("Type a question");

    await act(async () => {
      inputChatMessage(expectedText);
      fireEvent.keyDown(textArea, { key: "Enter", code: 13, charCode: 13 });
    });

    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith(expectedText, undefined, []);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("sends input with just the prompt question when the enter button is pressed while the file upload button is selected", async () => {
    const mockOnSend = jest.fn();
    const expectedText = "hello!!";

    const { container } = render(
      <QuestionInput
        onSend={mockOnSend}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    const sendButton = screen.getByLabelText("Ask question button");

    await act(async () => {
      inputChatMessage(expectedText);
      fireEvent.keyDown(sendButton, { key: "Enter", code: 13, charCode: 13 });
    });

    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith(expectedText, undefined, []);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("sends input with just the prompt question when the send button is clicked and no files are uploaded", async () => {
    const mockOnSend = jest.fn();
    const expectedText = "hello!!";

    const { container } = render(
      <QuestionInput
        onSend={mockOnSend}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      inputChatMessage(expectedText);
      clickSubmitButton();
    });

    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith(expectedText, undefined, []);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("sends the conversationId with the input when the conversationId is not undefined", async () => {
    const mockOnSend = jest.fn();
    const expectedText = "hello!!";
    const expectedConversationId = "Id";

    const { container } = render(
      <QuestionInput
        onSend={mockOnSend}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={expectedConversationId}
        clearOnSend={false}
      />
    );

    await act(async () => {
      inputChatMessage(expectedText);
      clickSubmitButton();
    });

    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith(expectedText, expectedConversationId, []);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("sends input with the uploaded file when the send button is clicked and one file is uploaded", async () => {
    const mockOnSend = jest.fn();
    const expectedText = "hello!!";

    const uploadedFileContents = "hello";
    const uploadedFile = createMockFile("csv", ACCEPTED_FILE_TYPES.CSV, 5, uploadedFileContents);
    const expectedUploadedFilesArray: UploadedFile[] = [
      {
        name: uploadedFile.name,
        contents: uploadedFileContents,
        extension: ACCEPTED_FILE_TYPES.CSV,
        size: uploadedFile.size,
      },
    ];

    const { container } = render(
      <QuestionInput
        onSend={mockOnSend}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      inputChatMessage(expectedText);
      uploadFiles([uploadedFile]);
      clickSubmitButton();
    });

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledTimes(1);
      expect(mockOnSend).toHaveBeenCalledWith(expectedText, undefined, expectedUploadedFilesArray);
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("sends input with all uploaded files when the send button is clicked and multiple files are uploaded", async () => {
    const mockOnSend = jest.fn();
    const expectedText = "hello!!";

    const uploadedFileContents = "hello";
    const uploadedFileOne = createMockFile("csv", ACCEPTED_FILE_TYPES.CSV, 5, uploadedFileContents);
    const uploadedFileTwo = createMockFile("csv", ACCEPTED_FILE_TYPES.CSV, 5, uploadedFileContents);
    const expectedUploadedFilesArray: UploadedFile[] = [
      {
        name: uploadedFileOne.name,
        contents: uploadedFileContents,
        extension: ACCEPTED_FILE_TYPES.CSV,
        size: uploadedFileOne.size,
      },
      {
        name: uploadedFileTwo.name,
        contents: uploadedFileContents,
        extension: ACCEPTED_FILE_TYPES.CSV,
        size: uploadedFileTwo.size,
      },
    ];

    const { container } = render(
      <QuestionInput
        onSend={mockOnSend}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      inputChatMessage(expectedText);
      uploadFiles([uploadedFileOne, uploadedFileTwo]);
      clickSubmitButton();
    });

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledTimes(1);
      expect(mockOnSend).toHaveBeenCalledWith(expectedText, undefined, expectedUploadedFilesArray);
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("does not send input when the send button is clicked but the prompt is only whitespace", async () => {
    const mockOnSend = jest.fn();
    const expectedText = "     ";

    const { container } = render(
      <QuestionInput
        onSend={mockOnSend}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      inputChatMessage(expectedText);
      clickSubmitButton();
    });

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("does not send input when the send button is clicked and files are uploaded but no prompt is entered", async () => {
    const mockOnSend = jest.fn();
    const expectedText = "";

    const uploadedFile = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);

    const { container } = render(
      <QuestionInput
        onSend={mockOnSend}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      inputChatMessage(expectedText);
      uploadFiles([uploadedFile]);
      clickSubmitButton();
    });

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("does not send input when the send button is clicked but file upload is disabled", async () => {
    const mockOnSend = jest.fn();
    const expectedText = "hello!!";

    const { container } = render(
      <QuestionInput
        onSend={mockOnSend}
        disabled={true}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await act(async () => {
      inputChatMessage(expectedText);
      clickSubmitButton();
    });

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    expect(await axe(container)).toHaveNoViolations();
  });
});
