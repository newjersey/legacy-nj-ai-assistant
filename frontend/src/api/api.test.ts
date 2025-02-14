import { ConversationRequest } from "../api/models";
import { ACCEPTED_FILE_TYPES, UploadedFile } from "../custom/fileUploadUtils";

import { conversationApi } from "./api";

describe("Test the conversationApi function", () => {
  const defaultUploadedFile: UploadedFile = {
    name: "default name",
    contents: "default contents",
    size: 100,
    extension: "default extension",
  };

  const defaultAbortSignal: AbortSignal = new AbortController().signal;

  const defaultFetchRequest = {
    body: "",
    headers: { "Content-Type": "application/json", "conversation-id": "" },
    method: "POST",
    signal: defaultAbortSignal,
  };

  const createConversationRequestWithUploadedFile = (
    files?: UploadedFile[]
  ): ConversationRequest => {
    return {
      messages: [
        {
          id: "default id",
          role: "default role",
          content: "default content",
          date: "default date",
          uploaded_files: files ?? undefined,
        },
      ],
    };
  };

  beforeEach(() => {
    global.fetch = jest.fn();
    global.structuredClone = jest.fn().mockImplementation((value) => {
      return JSON.parse(JSON.stringify(value));
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("formats content correctly when there is no uploaded file", async () => {
    const conversationRequest = createConversationRequestWithUploadedFile();

    await conversationApi(conversationRequest, defaultAbortSignal, null);

    expect(fetch).toHaveBeenCalledWith("/conversation", {
      ...defaultFetchRequest,
      body: expect.stringContaining('"content":"default content"'),
    });
  });

  it.each([
    ["jpg", ACCEPTED_FILE_TYPES.JPEG, "image_url"],
    ["png", ACCEPTED_FILE_TYPES.PNG, "image_url"],
    ["gif", ACCEPTED_FILE_TYPES.GIF, "image_url"],
    ["bmp", ACCEPTED_FILE_TYPES.BMP, "image_url"],
    ["tiff", ACCEPTED_FILE_TYPES.TIFF, "image_url"],
    ["docx", ACCEPTED_FILE_TYPES.DOCX, "Use the following document in your responses"],
    ["csv", ACCEPTED_FILE_TYPES.CSV, "CSV format"],
    ["pdf", ACCEPTED_FILE_TYPES.PDF, "Use the following document in your responses"],
  ])(
    "formats content correctly when a file of type .%s is uploaded",
    async (extension: string, fileType: ACCEPTED_FILE_TYPES, expectedString: string) => {
      const uploadedFile: UploadedFile = {
        ...defaultUploadedFile,
        extension: fileType,
      };
      const conversationRequest = createConversationRequestWithUploadedFile([uploadedFile]);

      await conversationApi(conversationRequest, defaultAbortSignal, null);

      expect(fetch).toHaveBeenCalledWith("/conversation", {
        ...defaultFetchRequest,
        body: expect.stringContaining(expectedString),
      });
    }
  );
});
