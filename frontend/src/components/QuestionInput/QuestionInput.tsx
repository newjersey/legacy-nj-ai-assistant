import { useRef, useState } from "react";
import pdfToText from "react-pdftotext";
import icons from "@newjersey/njwds/dist/img/sprite.svg";
import { extractRawText } from "mammoth";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

import type { AlertsMap } from "../../utils/alertUtils";
import {
  defaultAlertsMap,
  ErrorAlertType,
  getFailedToReadFileErrorMessage,
  getFileExceedsMaxSizeErrorMessage,
  getImageExceedsMaxSizeErrorMessage,
} from "../../utils/alertUtils";
import type { SelectedFile, UploadedFile } from "../../utils/fileUploadUtils";
import { ACCEPTED_FILE_TYPES, isImageFile } from "../../utils/fileUploadUtils";
import { logEvent } from "../../utils/logEvent";
import * as CoachMark from "../CoachMark/CoachMark";

import {
  MAX_INPUT_LENGTH,
  MAX_UPLOADED_FILE_COUNT,
  MAX_UPLOADED_FILE_SIZE_IN_MB,
  MAX_UPLOADED_IMAGE_SIZE_IN_MB,
} from "./constants";
import { ErrorAlertContainer } from "./ErrorAlertContainer";
import { FileUploadPreviewContainer } from "./FileUploadPreviewContainer";

import styles from "./QuestionInput.module.css";

interface Props {
  onSend: (question: string, id?: string, uploadedFiles?: UploadedFile[]) => void;
  disabled: boolean;
  placeholder?: string;
  clearOnSend?: boolean;
  conversationId?: string;
}

function isValidLength(content: string) {
  return content.length <= MAX_INPUT_LENGTH;
}

export const QuestionInput = ({
  onSend,
  disabled,
  placeholder,
  clearOnSend,
  conversationId,
}: Props) => {
  const [question, setQuestion] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coachMarkReferenceRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [inputErrors, setInputErrors] = useState<AlertsMap>(defaultAlertsMap);

  const filterUploadedFilesBySize = (files: FileList): File[] => {
    const oversizeImageFileNames: string[] = [];
    const oversizeNonImageFileNames: string[] = [];
    const validFiles = [...files].filter((file) => {
      if (file.type.includes("image") && file.size > MAX_UPLOADED_IMAGE_SIZE_IN_MB * 1024 * 1024) {
        oversizeImageFileNames.push(file.name);

        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }

        logEvent("submit_prompt_client_error_file_size", {
          object_size: file.size,
          object_type: file.type,
        });

        return;
      } else if (file.size > MAX_UPLOADED_FILE_SIZE_IN_MB * 1024 * 1024) {
        oversizeNonImageFileNames.push(file.name);

        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }
        logEvent("submit_prompt_client_error_file_size", {
          object_size: file.size,
          object_type: file.type,
        });

        return;
      }

      return file;
    });

    if (oversizeImageFileNames.length > 0) {
      setInputErrors((prevInputErrors) => ({
        ...prevInputErrors,
        [ErrorAlertType.IMAGE_EXCEEDS_MAX_SIZE]:
          getImageExceedsMaxSizeErrorMessage(oversizeImageFileNames),
      }));
    }
    if (oversizeNonImageFileNames.length > 0) {
      setInputErrors((prevInputErrors) => ({
        ...prevInputErrors,
        [ErrorAlertType.FILE_EXCEEDS_MAX_SIZE]:
          getFileExceedsMaxSizeErrorMessage(oversizeNonImageFileNames),
      }));
    }

    return validFiles;
  };

  const getTotalFileContentLength = (uploadedFiles: UploadedFile[]) => {
    let totalFileContentLength = 0;

    uploadedFiles.forEach((file) => {
      if (!isImageFile(file)) {
        totalFileContentLength += file.contents.join("").length;
      }
    });

    return totalFileContentLength;
  };

  const sendQuestion = async () => {
    setInputErrors(defaultAlertsMap);

    if (!question.trim()) {
      setInputErrors((prevInputErrors) => ({
        ...prevInputErrors,
        [ErrorAlertType.PROMPT_NOT_ENTERED]:
          "Please enter a prompt into the text field to continue.",
      }));

      return;
    }

    if (disabled) {
      return;
    }

    const filesWithProcessingErrors: string[] = [];

    const uploadedFiles = await Promise.all(
      selectedFiles.map(async (selectedFile) => {
        try {
          return await extractDataFromFile(selectedFile);
        } catch (e) {
          if (e instanceof Error) {
            filesWithProcessingErrors.push(e.message);
            return null;
          }
        }
      })
    ).then((files) => files.filter((file): file is UploadedFile => file !== null));

    if (filesWithProcessingErrors.length > 0) {
      setInputErrors((prevInputErrors) => ({
        ...prevInputErrors,
        [ErrorAlertType.FAILED_TO_READ_FILE]:
          getFailedToReadFileErrorMessage(filesWithProcessingErrors),
      }));
    }

    if (!isValidLength(question)) {
      setInputErrors((prevInputErrors) => ({
        ...prevInputErrors,
        [ErrorAlertType.EXCEEDED_PROMPT_CHARACTER_LIMIT]: `Prompt cannot exceed ${MAX_INPUT_LENGTH} characters. Please try a smaller prompt.`,
      }));

      logEvent("submit_prompt_client_error_prompt_length", {
        input_length: question.length,
      });

      return;
    }

    if (Array.isArray(uploadedFiles)) {
      if (uploadedFiles.length > 0 && getTotalFileContentLength(uploadedFiles) > MAX_INPUT_LENGTH) {
        setInputErrors((prevInputErrors) => ({
          ...prevInputErrors,
          [ErrorAlertType.EXCEEDED_FILE_CONTENT_CHARACTER_LIMIT]: `Total file contents cannot exceed ${MAX_INPUT_LENGTH} characters. Please try a smaller file.`,
        }));

        setSelectedFiles([]);

        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }

        logEvent("submit_prompt_client_error_file_length", {
          object_types: uploadedFiles.map((file) => file.extension),
          object_lengths: uploadedFiles.map((file) => file.contents.join("").length),
          object_sizes: uploadedFiles.map((file) => file.size),
        });

        return;
      }

      onSend(question, conversationId, uploadedFiles);
    }

    if (clearOnSend) {
      setQuestion("");
      setSelectedFiles([]);
      if (fileInputRef?.current?.value) {
        fileInputRef.current.value = "";
      }
    }
  };

  const extractDataFromFile = async (selectedFile: File): Promise<UploadedFile> => {
    let uploadedFile: UploadedFile = { name: "", contents: [], extension: "", size: 0 };

    try {
      if (selectedFile.type === ACCEPTED_FILE_TYPES.PDF) {
        const extractedText = await pdfToText(selectedFile);

        if (extractedText.length === 0) {
          throw new Error();
        } else {
          uploadedFile = {
            name: selectedFile.name,
            contents: [extractedText],
            extension: selectedFile.type,
            size: selectedFile.size,
          };
        }
      } else if (selectedFile.type === ACCEPTED_FILE_TYPES.CSV) {
        uploadedFile = await new Promise<UploadedFile>((resolve) => {
          const reader = new FileReader();

          reader.onload = () => {
            const result = reader.result as string;

            resolve({
              name: selectedFile.name,
              contents: [result],
              extension: selectedFile.type,
              size: selectedFile.size,
            });
          };

          reader.readAsText(selectedFile);
        });
      } else if (selectedFile.type === ACCEPTED_FILE_TYPES.DOCX) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const extractedText = (await extractRawText({ arrayBuffer })).value;

        if (extractedText.length === 0) {
          throw new Error();
        } else {
          uploadedFile = {
            name: selectedFile.name,
            contents: [extractedText],
            extension: selectedFile.type,
            size: selectedFile.size,
          };
        }
      } else if (
        selectedFile.type === ACCEPTED_FILE_TYPES.XLSX ||
        selectedFile.type === ACCEPTED_FILE_TYPES.XLS
      ) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const workbookContents: string[] = [];
        const sheetNames: string[] = [];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const worksheetAsCsvString = XLSX.utils.sheet_to_csv(worksheet);
          workbookContents.push(worksheetAsCsvString);
          sheetNames.push(sheetName);
        });

        if (workbookContents.length === 0) {
          throw new Error();
        } else {
          uploadedFile = {
            name: selectedFile.name,
            contents: workbookContents,
            extension: selectedFile.type,
            size: selectedFile.size,
            sheets: sheetNames,
          };
        }
      } else {
        uploadedFile = await new Promise<UploadedFile>((resolve) => {
          const reader = new FileReader();

          reader.onload = () => {
            const result = reader.result as string;
            resolve({
              name: selectedFile.name,
              contents: [result],
              extension: selectedFile.type,
              size: selectedFile.size,
            });
          };

          reader.readAsDataURL(selectedFile);
        });
      }
    } catch (e) {
      throw new Error(selectedFile.name);
    }

    return uploadedFile;
  };

  const onTextareaEnterPress = (event: React.KeyboardEvent<Element>) => {
    if (event.key === "Enter" && !event.shiftKey && !(event.nativeEvent?.isComposing === true)) {
      event.preventDefault();
      sendQuestion();
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files != null) {
      setInputErrors(defaultAlertsMap);
      const validFiles = filterUploadedFilesBySize(files);

      if (validFiles.length === 0 && fileInputRef?.current?.value) {
        fileInputRef.current.value = "";
      }

      const filesWithIds = validFiles.map((file) => {
        const fileWithId = file as SelectedFile;

        fileWithId.fileId = uuidv4();

        return fileWithId;
      });

      const selectedFilesToSet = [...selectedFiles, ...filesWithIds];

      if (selectedFilesToSet.length > MAX_UPLOADED_FILE_COUNT) {
        setSelectedFiles(selectedFilesToSet.slice(0, MAX_UPLOADED_FILE_COUNT));

        setInputErrors((prevInputErrors) => ({
          ...prevInputErrors,
          [ErrorAlertType.EXCEEDED_MAX_FILE_COUNT]: `A maximum of ${MAX_UPLOADED_FILE_COUNT} files can be uploaded.`,
        }));

        logEvent("upload_files_error_file_count", {
          file_count: selectedFilesToSet.length,
        });
      } else {
        setSelectedFiles([...selectedFiles, ...filesWithIds]);
      }
    }
  };

  const onFileUploadButtonEnterPress = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" && fileInputRef.current != null) {
      fileInputRef.current.click();
    }
  };

  const onFileUploadButtonClick = () => {
    if (fileInputRef.current != null) {
      fileInputRef.current.click();
    }
  };

  const closePreview = (idToClose: string): void => {
    setSelectedFiles((selectedFiles) => selectedFiles.filter((file) => file.fileId !== idToClose));
  };

  const removeError = (alertTypeToRemove: keyof typeof ErrorAlertType): void => {
    setInputErrors((prevInputErrors) => ({
      ...prevInputErrors,
      [alertTypeToRemove]: null,
    }));
  };

  const coachMark = CoachMark.useCoachMark({
    id: "multiple-file-upload",
    referenceRef: coachMarkReferenceRef,
    coachMarkPortal: (
      <CoachMark.Portal allowedPlacements={["top"]}>
        <CoachMark.Heading>New file upload features</CoachMark.Heading>
        <CoachMark.Description>
          <ul className="usa-list margin-1 maxw-mobile-lg">
            <li>Upload up to 10 files.</li>
            <li>File size limit increased to 50MB for files, 10MB for images.</li>
            <li>
              Supported file types: PDF, DOCX, XLS/XLSX, CSV, and most image types (JPEG, PNG, TIFF,
              BMP, GIF).
            </li>
            <li>Updated content filters to accept a wider variety of prompts.</li>
          </ul>
        </CoachMark.Description>
      </CoachMark.Portal>
    ),
  });

  return (
    <CoachMark.Root coachMark={coachMark}>
      <div className="width-full">
        <ErrorAlertContainer onRemove={removeError} alerts={inputErrors} />

        <div className={styles.questionInput}>
          <textarea
            className={`usa-textarea maxw-none border-0 padding-x-205 height-auto minh-9 ${styles.questionInputTextArea}`}
            placeholder={placeholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onTextareaEnterPress}
            aria-label="Type a question"
          ></textarea>

          {selectedFiles.length > 0 && (
            <FileUploadPreviewContainer
              onClose={closePreview}
              files={selectedFiles.map((file) => ({ name: file.name, fileId: file.fileId }))}
            />
          )}

          <div
            className={`display-flex margin-bottom-3 width-full padding-x-2 ${styles.questionInputChatButtons}`}
          >
            <button
              ref={coachMarkReferenceRef}
              {...coachMark.getReferenceProps()}
              className={`usa-button usa-button--unstyled text-no-underline display-flex ${styles.fileInputButton}`}
              onKeyDown={onFileUploadButtonEnterPress}
              onClick={onFileUploadButtonClick}
              tabIndex={0}
              aria-label="Upload files"
            >
              <svg
                className="usa-icon margin-right-05"
                aria-hidden="true"
                focusable="false"
                role="img"
              >
                <use href={`${icons}#attach_file`} />
              </svg>
              Upload files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              data-testid="file-upload"
              accept={(Object.values(ACCEPTED_FILE_TYPES) as string[]).join(",")}
              onChange={onFileChange}
              disabled={disabled}
              tabIndex={-1}
              className={styles.fileInput}
              aria-hidden="true"
              multiple
            />
            <div
              className="usa-button margin-right-0"
              id={styles.questionInputSendButtonContainer}
              role="button"
              tabIndex={0}
              aria-label="Ask question button"
              onClick={sendQuestion}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? sendQuestion() : null)}
            >
              <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
                <use href={`${icons}#send`} />
              </svg>
            </div>
          </div>
          <hr
            className={`margin-bottom-0 width-full bottom-0 left-0 border-0 ${styles.questionInputBottomBorder}`}
          />
        </div>
      </div>
    </CoachMark.Root>
  );
};
