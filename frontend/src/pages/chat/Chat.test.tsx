import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import "@testing-library/jest-dom";

import * as api from "../../api";
import { createMockFile } from "../../test/factories";
import { ACCEPTED_FILE_TYPES } from "../../utils/fileUploadUtils";
import * as logEvent from "../../utils/logEvent";

import { Chat } from "./Chat";
jest.mock("../../api");

expect.extend(toHaveNoViolations);

function uploadFiles(uploadedFiles: File[]) {
  const fileInput = screen.getByTestId("file-upload");

  userEvent.upload(fileInput, uploadedFiles);
}

async function inputChatMessage() {
  const textInputField = screen.getByLabelText("Type a question");

  await userEvent.type(textInputField, "This is my message");
}

function clickSubmitButton() {
  const submitButton = screen.getByLabelText("Ask question button");

  userEvent.click(submitButton);
}

describe("Test the Chat component", () => {
  it("correctly renders the Chat component without any axe violations", async () => {
    const { container } = render(<Chat />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test the user attachment disclaimer text", () => {
  beforeEach(() => {
    const defaultMockResponse = {
      status: 200,
      json: async () => ({
        token: "MOCKED_GITHUB_INSTALLATION_ACCESS_TOKEN",
      }),
    } as Response;

    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    jest
      .spyOn(api, "conversationApi")
      .mockImplementation(() => Promise.resolve(defaultMockResponse));
  });

  afterEach(jest.clearAllMocks);

  it("Displays the correct text when one file is referenced", async () => {
    const uploadedFile = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);

    const { container } = render(<Chat />);

    await inputChatMessage();
    uploadFiles([uploadedFile]);
    clickSubmitButton();

    await waitFor(() => {
      expect(screen.getByText(`${uploadedFile.name} is being referenced`)).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("Displays the correct text when multiple files are referenced", async () => {
    const uploadedFileOne = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);
    const uploadedFileTwo = createMockFile("png", ACCEPTED_FILE_TYPES.PNG);
    const uploadedFileThree = createMockFile("gif", ACCEPTED_FILE_TYPES.GIF);

    const { container } = render(<Chat />);

    await inputChatMessage();
    uploadFiles([uploadedFileOne, uploadedFileTwo, uploadedFileThree]);
    clickSubmitButton();

    await waitFor(() => {
      expect(
        screen.getByText(
          `Files referenced: ${uploadedFileOne.name}, ${uploadedFileTwo.name}, ${uploadedFileThree.name}`
        )
      ).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("Displays the correct text with truncated file name when a file with a long name is being referenced", async () => {
    const uploadedFile = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);
    Object.defineProperty(uploadedFile, "name", { value: "veryveryveryverylongname.jpg" });

    const expectedDisplayName = "veryveryv...gname.jpg";

    const { container } = render(<Chat />);

    await inputChatMessage();
    uploadFiles([uploadedFile]);
    clickSubmitButton();

    await waitFor(() => {
      expect(screen.getByText(`${expectedDisplayName} is being referenced`)).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test uploaded image previews", () => {
  it("Displays previews of images being referenced within the user message bubble", async () => {
    const uploadedFileOne = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);
    const uploadedFileTwo = createMockFile("png", ACCEPTED_FILE_TYPES.PNG);
    const uploadedFileThree = createMockFile("gif", ACCEPTED_FILE_TYPES.GIF);

    const { container } = render(<Chat />);

    await inputChatMessage();
    uploadFiles([uploadedFileOne, uploadedFileTwo, uploadedFileThree]);
    clickSubmitButton();

    await waitFor(() => {
      expect(screen.queryByAltText(`${uploadedFileOne.name}`)).toBeInTheDocument();
      expect(screen.queryByAltText(`${uploadedFileTwo.name}`)).toBeInTheDocument();
      expect(screen.queryByAltText(`${uploadedFileThree.name}`)).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("Displays previews of only images being referenced when both image and non-image files are referenced within a conversation", async () => {
    const uploadedFileOne = createMockFile("jpg", ACCEPTED_FILE_TYPES.JPEG);
    const uploadedFileTwo = createMockFile("csv", ACCEPTED_FILE_TYPES.CSV);
    const uploadedFileThree = createMockFile("gif", ACCEPTED_FILE_TYPES.GIF);

    const { container } = render(<Chat />);

    await inputChatMessage();
    uploadFiles([uploadedFileOne, uploadedFileTwo, uploadedFileThree]);
    clickSubmitButton();

    await waitFor(() => {
      expect(screen.queryByAltText(`${uploadedFileOne.name}`)).toBeInTheDocument();
      expect(screen.queryByAltText(`${uploadedFileTwo.name}`)).not.toBeInTheDocument();
      expect(screen.queryByAltText(`${uploadedFileThree.name}`)).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test copy prompt/response", () => {
  beforeEach(() => {
    const defaultMockResponse = {
      status: 200,
    } as unknown as Response;

    jest
      .spyOn(api, "conversationApi")
      .mockImplementation(() => Promise.resolve(defaultMockResponse));

    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(jest.clearAllMocks);

  it("renders prompt copy text", async () => {
    const { container } = render(<Chat />);

    const logEventSpy = jest.spyOn(logEvent, "logEvent");

    // Submit a query, make sure the prompt appears
    await inputChatMessage();
    clickSubmitButton();
    expect(await screen.findByText("Copy")).toBeInTheDocument();

    // Copy the prompt, check that the correct alert shows up
    userEvent.setup(); // Enable clipboard to work
    const copyPromptButton = screen.getByTestId("prompt-copy-button");
    await userEvent.click(copyPromptButton);
    expect(await screen.findByText("Prompt copied to clipboard.")).toBeInTheDocument();

    expect(logEventSpy).toHaveBeenCalledWith("copy_prompt_text", {});
    expect(logEventSpy).toHaveBeenCalledTimes(1);

    // Close the alert
    const closeButton = screen.getByTestId("close-button");
    await userEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText("Prompt copied to clipboard.")).not.toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Test coach marks", () => {
  it("renders one coach mark maximum", () => {
    render(<Chat />);
    const coachMarks = screen.queryAllByTestId("coach-mark");
    expect(coachMarks.length).toBeLessThanOrEqual(1);
  });
});
