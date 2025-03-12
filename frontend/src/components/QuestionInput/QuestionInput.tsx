import { useRef, useState } from "react";
import pdfToText from "react-pdftotext";
import icons from "@newjersey/njwds/dist/img/sprite.svg";
import { extractRawText } from "mammoth";
import { v4 as uuidv4 } from "uuid";

import type { Alert } from "../../utils/alertUtils";
import type { SelectedFile, UploadedFile } from "../../utils/fileUploadUtils";
import { ACCEPTED_FILE_TYPES, isImageFile, truncateFilename } from "../../utils/fileUploadUtils";
import { logEvent } from "../../utils/logEvent";

import { AlertContainer } from "./AlertContainer";
import {
  MAX_INPUT_LENGTH,
  MAX_UPLOADED_FILE_COUNT,
  MAX_UPLOADED_FILE_SIZE_IN_MB,
  MAX_UPLOADED_IMAGE_SIZE_IN_MB,
} from "./constants";
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

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [inputErrors, setInputErrors] = useState<Alert[]>([]);

  const filterUploadedFilesBySize = (files: FileList): File[] => {
    const inputSizeErrors: Alert[] = [];
    const validFiles = [...files].filter((file) => {
      if (file.type.includes("image") && file.size > MAX_UPLOADED_IMAGE_SIZE_IN_MB * 1024 * 1024) {
        inputSizeErrors.push({
          message: `${truncateFilename(file.name)} exceeds ${MAX_UPLOADED_IMAGE_SIZE_IN_MB} MB and cannot be uploaded`,
          id: `exceedsMaxSize-${uuidv4()}`,
        });

        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }

        logEvent("submit_prompt_client_error_file_size", {
          object_size: file.size,
          object_type: file.type,
        });

        return;
      } else if (file.size > MAX_UPLOADED_FILE_SIZE_IN_MB * 1024 * 1024) {
        inputSizeErrors.push({
          message: `${truncateFilename(file.name)} exceeds ${MAX_UPLOADED_FILE_SIZE_IN_MB} MB and cannot be uploaded`,
          id: `exceedsMaxSize-${uuidv4()}`,
        });

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

    setInputErrors([...inputErrors, ...inputSizeErrors]);

    return validFiles;
  };

  const getTotalFileContentLength = (uploadedFiles: UploadedFile[]) => {
    let totalFileContentLength = 0;

    uploadedFiles.forEach((file) => {
      if (!isImageFile(file)) {
        totalFileContentLength += file.contents.length;
      }
    });

    return totalFileContentLength;
  };

  const sendQuestion = async () => {
    if (!question.trim()) {
      setInputErrors([
        ...inputErrors,
        {
          message: `Please enter a prompt into the text field to continue.`,
          id: `promptNotEnteredError-${uuidv4()}`,
        },
      ]);

      return;
    }

    if (disabled) {
      return;
    }

    const uploadedFiles = await Promise.all(
      selectedFiles.map(async (selectedFile): Promise<UploadedFile> => {
        const uploadedFile = await extractDataFromFile(selectedFile);

        return uploadedFile;
      })
    );

    if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
      if (getTotalFileContentLength(uploadedFiles) > MAX_INPUT_LENGTH) {
        setInputErrors([
          ...inputErrors,
          {
            message: `Total file contents cannot exceed ${MAX_INPUT_LENGTH} characters. Please try a smaller file.`,
            id: `exceededFileContentCharacterLimitError-${uuidv4()}`,
          },
        ]);

        setSelectedFiles([]);

        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }

        logEvent("submit_prompt_client_error_file_length", {
          object_types: uploadedFiles.map((file) => file.extension),
          object_lengths: uploadedFiles.map((file) => file.contents.length),
          object_sizes: uploadedFiles.map((file) => file.size),
        });

        return;
      }
    }

    if (!isValidLength(question)) {
      setInputErrors([
        ...inputErrors,
        {
          message: `Prompt cannot exceed ${MAX_INPUT_LENGTH} characters. Please try a smaller prompt.`,
          id: `exceededPromptCharacterLimitError-${uuidv4()}`,
        },
      ]);

      logEvent("submit_prompt_client_error_prompt_length", {
        input_length: question.length,
      });

      return;
    }

    onSend(question, conversationId, uploadedFiles);

    if (clearOnSend) {
      setQuestion("");
      setSelectedFiles([]);
      setInputErrors([]);
      if (fileInputRef?.current?.value) {
        fileInputRef.current.value = "";
      }
    }
  };

  const extractDataFromFile = async (selectedFile: File): Promise<UploadedFile> => {
    let uploadedFile: UploadedFile = { name: "", contents: "", extension: "", size: 0 };

    if (selectedFile.type === ACCEPTED_FILE_TYPES.PDF) {
      try {
        const extractedText = await pdfToText(selectedFile);

        if (extractedText.length === 0) {
          throw new Error();
        } else {
          uploadedFile = {
            name: selectedFile.name,
            contents: extractedText,
            extension: selectedFile.type,
            size: selectedFile.size,
          };
        }
      } catch (e) {
        setInputErrors([
          ...inputErrors,
          {
            message: `Could not read text from PDF: ${truncateFilename(selectedFile.name)}. Please try uploading a different file.`,
            id: `${selectedFile.name}-failedToReadPdf-${uuidv4()}`,
          },
        ]);
      }
    } else if (selectedFile.type === ACCEPTED_FILE_TYPES.CSV) {
      uploadedFile = await new Promise<UploadedFile>((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = reader.result as string;

          resolve({
            name: selectedFile.name,
            contents: result,
            extension: selectedFile.type,
            size: selectedFile.size,
          });
        };

        reader.readAsText(selectedFile);
      });
    } else if (selectedFile.type === ACCEPTED_FILE_TYPES.DOCX) {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const extractedText = (await extractRawText({ arrayBuffer })).value;

        if (extractedText.length === 0) {
          throw new Error();
        } else {
          uploadedFile = {
            name: selectedFile.name,
            contents: extractedText,
            extension: selectedFile.type,
            size: selectedFile.size,
          };
        }
      } catch (err) {
        setInputErrors([
          ...inputErrors,
          {
            message: `Could not read text from .docx file: ${truncateFilename(selectedFile.name)}. Please try uploading a different file.`,
            id: `${selectedFile.name}-failedToReadDocx-${Date.now()}`,
          },
        ]);
      }
    } else {
      uploadedFile = await new Promise<UploadedFile>((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = reader.result as string;
          resolve({
            name: selectedFile.name,
            contents: result,
            extension: selectedFile.type,
            size: selectedFile.size,
          });
        };

        reader.readAsDataURL(selectedFile);
      });
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

        setInputErrors([
          ...inputErrors,
          {
            message: `A maximum of ${MAX_UPLOADED_FILE_COUNT} files can be uploaded.`,
            id: `exceededMaxFileCount-${uuidv4()}`,
          },
        ]);
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

  const removeError = (idToRemove: string): void => {
    setInputErrors((inputErrors) => inputErrors.filter((error) => error.id !== idToRemove));
  };

  return (
    <div className="width-full">
      {inputErrors.length > 0 && <AlertContainer onRemove={removeError} alerts={inputErrors} />}

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
  );
};
