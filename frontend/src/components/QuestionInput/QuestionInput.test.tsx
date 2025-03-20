import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import { createMockFile } from "../../test/factories";
import { AlertType } from "../../utils/alertUtils";
import type { UploadedFile } from "../../utils/fileUploadUtils";
import { ACCEPTED_FILE_TYPES } from "../../utils/fileUploadUtils";

import {
  MAX_INPUT_LENGTH,
  MAX_UPLOADED_FILE_COUNT,
  MAX_UPLOADED_FILE_SIZE_IN_MB,
  MAX_UPLOADED_IMAGE_SIZE_IN_MB,
} from "./constants";

const uuidv4Mock = jest.fn();

jest.mock("uuid", () => ({
  v4: uuidv4Mock,
}));

import { QuestionInput } from "./QuestionInput";

expect.extend(toHaveNoViolations);

async function uploadFiles(uploadedFiles: File[]) {
  const fileInput = screen.getByTestId("file-upload");

  await userEvent.upload(fileInput, uploadedFiles);
}

async function inputChatMessage(message?: string) {
  const textInputField = screen.getByLabelText("Type a question");
  const input = message ?? "This is my message";

  await userEvent.type(textInputField, input);
}

async function clickSubmitButton() {
  const submitButton = screen.getByLabelText("Ask question button");

  await userEvent.click(submitButton);
}

describe("Test the QuestionInput component", () => {
  it("correctly renders the QuestionInput component without any axe violations", async () => {
    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
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

  afterEach(jest.clearAllMocks);

  it("displays the file upload preview when a file is uploaded", async () => {
    const uploadedFile = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedFile]);

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
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedFileOne, uploadedFileTwo]);

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
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedFile]);

    const fileUploadPreview = screen.getByTestId(`filePreview-${defaultMockUuid}`);
    expect(fileUploadPreview).toBeInTheDocument();

    const fileUploadPreviewCloseButton = within(fileUploadPreview!).getByRole("button");
    expect(fileUploadPreviewCloseButton).toBeInTheDocument();

    await userEvent.click(fileUploadPreviewCloseButton);

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
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedFileOne, uploadedFileTwo]);

    const fileUploadPreviewOne = screen.getByTestId(`filePreview-${mockUuidOne}`);
    expect(fileUploadPreviewOne).toBeInTheDocument();

    const fileUploadPreviewTwo = screen.getByTestId(`filePreview-${mockUuidTwo}`);
    expect(fileUploadPreviewTwo).toBeInTheDocument();

    const fileUploadPreviewOneCloseButton = within(fileUploadPreviewOne).getByRole("button");
    expect(fileUploadPreviewOneCloseButton).toBeInTheDocument();

    await userEvent.click(fileUploadPreviewOneCloseButton);

    const fileUploadPreviewOneAfter = screen.queryByTestId(`filePreview-${mockUuidOne}`);
    const fileUploadPreviewTwoAfter = screen.queryByTestId(`filePreview-${mockUuidTwo}`);

    expect(fileUploadPreviewOneAfter).not.toBeInTheDocument();
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

  afterEach(jest.clearAllMocks);

  it("displays an error alert when there is an error uploading a file", async () => {
    const uploadedFile = createMockFile(
      "png",
      ACCEPTED_FILE_TYPES.PNG,
      MAX_UPLOADED_IMAGE_SIZE_IN_MB + 5
    );

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedFile]);

    const inputError = screen.getByTestId(AlertType.IMAGE_EXCEEDS_MAX_SIZE);

    expect(inputError).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("removes the error alert when the close button is clicked", async () => {
    const uploadedFile = createMockFile(
      "png",
      ACCEPTED_FILE_TYPES.PNG,
      MAX_UPLOADED_IMAGE_SIZE_IN_MB + 5
    );

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedFile]);

    const inputError = screen.getByTestId(AlertType.IMAGE_EXCEEDS_MAX_SIZE);
    expect(inputError).toBeInTheDocument();

    const inputErrorCloseButton = within(inputError!).getByRole("button");
    expect(inputErrorCloseButton).toBeInTheDocument();

    await userEvent.click(inputErrorCloseButton);

    const inputErrorAfter = screen.queryByTestId(AlertType.IMAGE_EXCEEDS_MAX_SIZE);

    expect(inputErrorAfter).not.toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays multiple error alerts when there are multiple errors uploading files", async () => {
    const uploadedFileOne = createMockFile(
      "png",
      ACCEPTED_FILE_TYPES.PNG,
      MAX_UPLOADED_IMAGE_SIZE_IN_MB + 5
    );
    const mockUuidOne = "mockUuidOne";
    const uploadedFileTwo = createMockFile(
      "pdf",
      ACCEPTED_FILE_TYPES.PDF,
      MAX_UPLOADED_FILE_SIZE_IN_MB + 5
    );
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
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedFileOne, uploadedFileTwo]);

    const inputErrorOne = screen.getByTestId(AlertType.IMAGE_EXCEEDS_MAX_SIZE);
    expect(inputErrorOne).toBeInTheDocument();
    const inputErrorTwo = screen.getByTestId(AlertType.FILE_EXCEEDS_MAX_SIZE);
    expect(inputErrorTwo).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("removes the appropriate error alert when one of many alerts is closed", async () => {
    const uploadedFileOne = createMockFile(
      "png",
      ACCEPTED_FILE_TYPES.PNG,
      MAX_UPLOADED_IMAGE_SIZE_IN_MB + 5
    );
    const uploadedFileTwo = createMockFile(
      "pdf",
      ACCEPTED_FILE_TYPES.PDF,
      MAX_UPLOADED_FILE_SIZE_IN_MB + 5
    );

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedFileOne, uploadedFileTwo]);

    const inputErrorOne = screen.getByTestId(AlertType.IMAGE_EXCEEDS_MAX_SIZE);
    expect(inputErrorOne).toBeInTheDocument();
    const inputErrorTwo = screen.getByTestId(AlertType.FILE_EXCEEDS_MAX_SIZE);
    expect(inputErrorTwo).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();

    const inputErrorOneCloseButton = within(inputErrorOne).getByRole("button");

    expect(inputErrorOneCloseButton).toBeInTheDocument();

    await userEvent.click(inputErrorOneCloseButton);

    const inputErrorOneAfter = screen.queryByTestId(AlertType.IMAGE_EXCEEDS_MAX_SIZE);
    const inputErrorTwoAfter = screen.queryByTestId(AlertType.FILE_EXCEEDS_MAX_SIZE);

    expect(inputErrorOneAfter).not.toBeInTheDocument();
    expect(inputErrorTwoAfter).toBeInTheDocument();

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
      const uploadedFile = createMockFile(extension, fileType, MAX_UPLOADED_IMAGE_SIZE_IN_MB + 5);

      const { container } = render(
        <QuestionInput
          onSend={jest.fn()}
          disabled={false}
          placeholder={"placeholder"}
          conversationId={undefined}
          clearOnSend={false}
        />
      );

      await uploadFiles([uploadedFile]);

      const inputError = screen.queryByText(/exceeds 10 MB and cannot be uploaded/i);

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
      const uploadedFile = createMockFile(extension, fileType, MAX_UPLOADED_FILE_SIZE_IN_MB + 5);

      const { container } = render(
        <QuestionInput
          onSend={jest.fn()}
          disabled={false}
          placeholder={"placeholder"}
          conversationId={undefined}
          clearOnSend={false}
        />
      );

      await uploadFiles([uploadedFile]);

      const inputError = screen.queryByText(/exceeds 50 MB and cannot be uploaded/i);

      expect(inputError).toBeInTheDocument();

      expect(await axe(container)).toHaveNoViolations();
    }
  );

  it("displays the appropriate input error if send button is clicked but no prompt is entered", async () => {
    const mockOnSend = jest.fn();

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

    await uploadFiles([uploadedFile]);
    await clickSubmitButton();

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a prompt into the text field to continue./)
      ).toBeInTheDocument();
    });

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays the appropriate input error if the total file contents are too long", async () => {
    const mockOnSend = jest.fn();

    const uploadedFile = createMockFile(
      "csv",
      ACCEPTED_FILE_TYPES.CSV,
      8,
      "a".repeat(MAX_INPUT_LENGTH + 5)
    );

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedFile]);
    await inputChatMessage();
    await clickSubmitButton();

    await waitFor(() => {
      expect(screen.getByText(/Please try a smaller file./)).toBeInTheDocument();
    });

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays the appropriate input error if the prompt length is too long", async () => {
    const mockOnSend = jest.fn();

    const prompt = "a".repeat(MAX_INPUT_LENGTH + 5);

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    // use fireEvent here to avoid timeouts caused by userEvent
    fireEvent.change(screen.getByLabelText("Type a question"), {
      target: { value: prompt },
    });
    await clickSubmitButton();

    expect(screen.getByText(/Please try a smaller prompt./)).toBeInTheDocument();

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays the appropriate input error if text cannot be read from a .pdf file", async () => {
    const mockOnSend = jest.fn();

    const uploadedPdfFile = createMockFile("pdf", ACCEPTED_FILE_TYPES.PDF, 8, "");

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedPdfFile]);
    await inputChatMessage();
    await clickSubmitButton();

    expect(screen.getByText(/Could not read text from PDF:/)).toBeInTheDocument();

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays the appropriate input error if text cannot be read from a .docx file", async () => {
    const mockOnSend = jest.fn();

    const uploadedDocxFile = createMockFile("docx", ACCEPTED_FILE_TYPES.DOCX, 8, "");

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([uploadedDocxFile]);
    await inputChatMessage();
    await clickSubmitButton();

    expect(screen.getByText(/Could not read text from .docx file:/)).toBeInTheDocument();

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("displays the appropriate input error if more than 10 files are uploaded", async () => {
    const mockFilesToUpload = Array.from({ length: MAX_UPLOADED_FILE_COUNT + 5 }, (_, _i) => {
      return createMockFile("png", ACCEPTED_FILE_TYPES.PNG);
    });

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles(mockFilesToUpload);

    const inputError = screen.queryByText(/A maximum of 10 files can be uploaded/);
    expect(inputError).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test uploading files", () => {
  afterEach(jest.clearAllMocks);

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
          onSend={jest.fn()}
          disabled={false}
          placeholder={"placeholder"}
          conversationId={undefined}
          clearOnSend={false}
        />
      );

      await uploadFiles([uploadedFile]);

      expect(await axe(container)).toHaveNoViolations();
    }
  );

  it("will display an error but upload other files if one file uploaded in a batch causes errors", async () => {
    const invalidUploadedFile = createMockFile(
      "png",
      ACCEPTED_FILE_TYPES.PNG,
      MAX_UPLOADED_IMAGE_SIZE_IN_MB + 5
    );
    const validUploadedFile = createMockFile("png", ACCEPTED_FILE_TYPES.PNG);
    const mockValidFileUuid = "validFileUuid";

    uuidv4Mock.mockImplementationOnce(() => {
      return mockValidFileUuid;
    });

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([invalidUploadedFile, validUploadedFile]);

    const inputError = screen.getByTestId(AlertType.IMAGE_EXCEEDS_MAX_SIZE);
    expect(inputError).toBeInTheDocument();

    const validFileUploadPreview = screen.getByTestId(`filePreview-${mockValidFileUuid}`);
    expect(validFileUploadPreview).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it("will remove existing error alerts when new files are uploaded", async () => {
    const invalidUploadedFile = createMockFile(
      "png",
      ACCEPTED_FILE_TYPES.PNG,
      MAX_UPLOADED_IMAGE_SIZE_IN_MB + 5
    );
    const validUploadedFile = createMockFile("png", ACCEPTED_FILE_TYPES.PNG);

    const { container } = render(
      <QuestionInput
        onSend={jest.fn()}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await uploadFiles([invalidUploadedFile]);

    await waitFor(() => {
      expect(screen.getByText(/exceeds .* MB and cannot be uploaded/)).toBeInTheDocument();
    });

    await uploadFiles([validUploadedFile]);

    await waitFor(() => {
      expect(screen.queryByText(/exceeds .* MB and cannot be uploaded./)).not.toBeInTheDocument();
    });

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

    await inputChatMessage(expectedText);

    fireEvent.focus(textArea);
    await userEvent.keyboard("[Enter]");

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

    await inputChatMessage(expectedText);

    fireEvent.focus(sendButton);
    await userEvent.keyboard("[Enter]");

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

    await inputChatMessage(expectedText);
    await clickSubmitButton();

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

    await inputChatMessage(expectedText);
    await clickSubmitButton();

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

    await inputChatMessage(expectedText);
    await uploadFiles([uploadedFile]);
    await clickSubmitButton();

    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith(expectedText, undefined, expectedUploadedFilesArray);

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

    await inputChatMessage(expectedText);
    await uploadFiles([uploadedFileOne, uploadedFileTwo]);
    await clickSubmitButton();

    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith(expectedText, undefined, expectedUploadedFilesArray);

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

    await inputChatMessage(expectedText);
    await clickSubmitButton();

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("does not send input when the send button is clicked but send function is disabled", async () => {
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

    await inputChatMessage(expectedText);
    await clickSubmitButton();

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("removes existing error alerts from the screen when the input is sent", async () => {
    const mockOnSend = jest.fn();

    const { container } = render(
      <QuestionInput
        onSend={mockOnSend}
        disabled={false}
        placeholder={"placeholder"}
        conversationId={undefined}
        clearOnSend={false}
      />
    );

    await clickSubmitButton();

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a prompt into the text field to continue./)
      ).toBeInTheDocument();
    });

    expect(mockOnSend).toHaveBeenCalledTimes(0);

    await inputChatMessage();
    await clickSubmitButton();

    await waitFor(() => {
      expect(
        screen.queryByText(/Please enter a prompt into the text field to continue./)
      ).not.toBeInTheDocument();
    });

    expect(mockOnSend).toHaveBeenCalledTimes(1);

    expect(await axe(container)).toHaveNoViolations();
  });
});
