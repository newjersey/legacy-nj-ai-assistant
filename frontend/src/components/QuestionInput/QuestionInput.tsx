import { useRef, useState } from "react";
import pdfToText from "react-pdftotext";
import icons from "@newjersey/njwds/dist/img/sprite.svg";
import { extractRawText } from "mammoth";
import { v4 as uuidv4 } from "uuid";

import { Alert } from "../../custom/alertUtils";
import {
  ACCEPTED_FILE_TYPES,
  isImageFile,
  SelectedFile,
  truncateFilename,
  UploadedFile,
} from "../../custom/fileUploadUtils";
import { logEvent } from "../../custom/logEvent";

import { AlertContainer } from "./AlertContainer";
import { FileUploadPreviewContainer } from "./FileUploadPreviewContainer";

import styles from "./QuestionInput.module.css";
import { throws } from "node:assert";

interface Props {
  onSend: (question: string, id?: string, uploadedFiles?: UploadedFile[]) => void;
  disabled: boolean;
  placeholder?: string;
  clearOnSend?: boolean;
  conversationId?: string;
}

const MAX_INPUT_LENGTH = 1048576;
const MAX_UPLOADED_FILE_COUNT = 10;

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

  const filterUploadedFilesByFiletype = (files: FileList): File[] => {
    const acceptedFileTypesArray = Object.values(ACCEPTED_FILE_TYPES) as string[];

    const validFiles = [...files].filter((file) => {
      if (!acceptedFileTypesArray.includes(file.type)) {
        logEvent("submit_prompt_client_error_file_type", { object_type: file.type });
      } else {
        return file;
      }
    });

    if (files.length !== validFiles.length) {
      const invalidFiletypeAlert: Alert = {
        message:
          "Only the following file types are supported: .csv, .docx, .pdf, .jpeg, .png, .gif, .bmp, .tiff. Please try a different file.",
        id: `invalidFiletype-${uuidv4()}`,
      };
      setInputErrors([...inputErrors, invalidFiletypeAlert]);
    }

    return validFiles;
  };

  const filterUploadedFilesBySize = (files: File[]): File[] => {
    const inputSizeErrors: Alert[] = [];
    const validFiles = files.filter((file) => {
      if (file.type.includes("image") && file.size > 10 * 1024 * 1024) {
        // 10MB limit for image files
        inputSizeErrors.push({
          message: `${truncateFilename(file.name)} exceeds 10MB and cannot be uploaded`,
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
      } else if (file.size > 50 * 1024 * 1024) {
        // 50MB limit for other filetypes
        inputSizeErrors.push({
          message: `${truncateFilename(file.name)} exceeds 50MB and cannot be uploaded`,
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

  const sendQuestion = async () => {
    if (disabled || !question.trim()) {
      return;
    }

    const send = (uploadedFiles?: UploadedFile[]) => {
      const sendInputErrors: Alert[] = [];

      const getTotalFileContentLength = (uploadedFiles: UploadedFile[]) => {
        let totalFileContentLength = 0;

        uploadedFiles.forEach((file) => {
          if (!isImageFile(file)) {
            totalFileContentLength += file.contents.length;
          }
        });

        return totalFileContentLength;
      };

      if (uploadedFiles != null && getTotalFileContentLength(uploadedFiles) > MAX_INPUT_LENGTH) {
        sendInputErrors.push({
          message: `Total file contents cannot exceed ${MAX_INPUT_LENGTH} characters. Please try a smaller file.`,
          id: `exceededFileContentCharacterLimitError-${uuidv4()}`,
        });

        setSelectedFiles([]);

        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }

        logEvent("submit_prompt_client_error_file_length", {
          object_types: uploadedFiles.map((file) => file.extension),
          object_lengths: uploadedFiles.map((file) => file.contents.length),
          object_sizes: uploadedFiles.map((file) => file.size),
        });
      }

      if (!isValidLength(question)) {
        sendInputErrors.push({
          message: `Prompt cannot exceed ${MAX_INPUT_LENGTH} characters. Please try a smaller prompt.`,
          id: `exceededPromptCharacterLimitError-${uuidv4()}`,
        });

        logEvent("submit_prompt_client_error_prompt_length", {
          input_length: question.length,
        });
      }

      if (conversationId) {
        onSend(question, conversationId, uploadedFiles);
      } else {
        onSend(question, undefined, uploadedFiles);
      }

      if (clearOnSend) {
        setQuestion("");
        setSelectedFiles([]);
        setInputErrors([]);
        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }
      }

      setInputErrors([...inputErrors, ...sendInputErrors]);
    };

    if (selectedFiles.length > 0) {
      const uploadedFiles: UploadedFile[] = await Promise.all(
        selectedFiles.map(async (selectedFile): Promise<UploadedFile> => {
          const uploadedFile = await extractDataFromFile(selectedFile);

          return uploadedFile;
        })
      );

      send(uploadedFiles);
    } else {
      send();
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
            id: `${selectedFile.name}-failedToUpload-${uuidv4()}`,
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
            id: `${selectedFile.name}-failedToUpload-${Date.now()}`,
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

  const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
    if (ev.key === "Enter" && !ev.shiftKey && !(ev.nativeEvent?.isComposing === true)) {
      ev.preventDefault();
      sendQuestion();
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files != null) {
      const validFilesByFiletype = filterUploadedFilesByFiletype(files);

      if (validFilesByFiletype.length === 0) {
        return;
      }

      const validFilesBySize = filterUploadedFilesBySize(validFilesByFiletype);

      const filesWithIds = validFilesBySize.map((file) => {
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

  const closePreview = (idToClose: string): void => {
    setSelectedFiles((selectedFiles) => selectedFiles.filter((file) => file.fileId !== idToClose));
  };

  const closeError = (idToClose: string): void => {
    setInputErrors((inputErrors) => inputErrors.filter((error) => error.id !== idToClose));
  };

  return (
    <div className="width-full">
      {inputErrors.length > 0 && <AlertContainer onClose={closeError} alerts={inputErrors} />}

      <div className={styles.questionInput}>
        <textarea
          className={`usa-textarea maxw-none border-0 padding-x-205 height-auto minh-9 ${styles.questionInputTextArea}`}
          placeholder={placeholder}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={onEnterPress}
          aria-label="Type a question"
        ></textarea>

        {selectedFiles.length > 0 && (
          <FileUploadPreviewContainer
            onClose={closePreview}
            files={selectedFiles.map((file) => {
              return { name: file.name, fileId: file.fileId };
            })}
          />
        )}

        <div
          className={`display-flex margin-bottom-3 width-full padding-x-2 ${styles.questionInputChatButtons}`}
        >
          <div>
            <label
              htmlFor="file-upload"
              className={`usa-button usa-button--unstyled text-no-underline ${styles.fileInputLabel}`}
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
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              accept={(Object.values(ACCEPTED_FILE_TYPES) as string[]).join(",")}
              onChange={onFileChange}
              disabled={disabled}
              className={styles.fileInput}
              aria-label="Upload file"
              multiple
            />
          </div>
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
