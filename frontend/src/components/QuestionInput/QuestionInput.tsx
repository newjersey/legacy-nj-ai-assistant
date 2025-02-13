import { useRef, useState } from "react";
import pdfToText from "react-pdftotext";
import icons from "@newjersey/njwds/dist/img/sprite.svg";
import { extractRawText } from "mammoth";

import { ACCEPTED_FILE_TYPES, isImageFile, UploadedFile } from "../../custom/fileUploadUtils";
import { logEvent } from "../../custom/logEvent";

import styles from "./QuestionInput.module.css";

interface Props {
  onSend: (question: string, id?: string, uploadedFile?: UploadedFile) => void;
  disabled: boolean;
  placeholder?: string;
  clearOnSend?: boolean;
  conversationId?: string;
}

const MAX_INPUT_LENGTH = 1048576;
function isValidLength(content: string) {
  return content.length <= MAX_INPUT_LENGTH;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, conversationId }: Props) => {
  const [question, setQuestion] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [inputError, setInputError] = useState<string>("");

  const sendQuestion = async () => {
    if (disabled || !question.trim()) {
      return;
    }

    const send = (uploadedFile?: UploadedFile) => {
      if (uploadedFile != null && !isImageFile(uploadedFile) && !isValidLength(uploadedFile.contents)) {
        setInputError(`File contents cannot exceed ${MAX_INPUT_LENGTH} characters. Please try a smaller file.`);
        setSelectedFile(null);
        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }
        logEvent("submit_prompt_client_error_file_length", {
          object_type: uploadedFile.extension,
          object_length: uploadedFile.contents.length,
          object_size: uploadedFile.size,
        });
        return;
      }

      if (!isValidLength(question)) {
        setInputError(`Prompt cannot exceed ${MAX_INPUT_LENGTH} characters. Please try a smaller prompt.`);
        logEvent("submit_prompt_client_error_prompt_length", {
          input_length: question.length,
        });
        return;
      }

      if (conversationId) {
        onSend(question, conversationId, uploadedFile);
      } else {
        onSend(question, undefined, uploadedFile);
      }

      if (clearOnSend) {
        setQuestion("");
        setSelectedFile(null);
        setInputError("");
        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }
      }
    };

    if (selectedFile) {
      if (selectedFile.type === ACCEPTED_FILE_TYPES.PDF) {
        pdfToText(selectedFile)
          .then((extractedText) => {
            if (extractedText.length === 0) {
              setInputError("Could not read text from PDF. Please try uploading a different file.");
            } else {
              send({
                name: selectedFile.name,
                contents: extractedText,
                extension: selectedFile.type,
                size: selectedFile.size,
              });
            }
          })
          .catch((_error) => {
            setInputError("Failed to upload PDF. Please try uploading a different file.");
          });
      } else if (selectedFile.type === ACCEPTED_FILE_TYPES.CSV) {
        const reader = new FileReader();
        reader.onloadend = () => {
          send({
            name: selectedFile.name,
            contents: reader.result as string,
            extension: selectedFile.type,
            size: selectedFile.size,
          });
        };

        reader.readAsText(selectedFile);
      } else if (selectedFile.type === ACCEPTED_FILE_TYPES.DOCX) {
        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const extractedText = (await extractRawText({ arrayBuffer })).value;

          if (extractedText.length === 0) {
            setInputError("Could not read text from document. Please try uploading a different file.");
          } else {
            send({
              name: selectedFile.name,
              contents: extractedText,
              extension: selectedFile.type,
              size: selectedFile.size,
            });
          }
        } catch (err) {
          setInputError("Failed to upload .docx file. Please try uploading a different file.");
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          send({
            name: selectedFile.name,
            contents: reader.result as string,
            extension: selectedFile.type,
            size: selectedFile.size,
          });
        };
        reader.readAsDataURL(selectedFile);
      }
    } else {
      send();
    }
  };

  const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
    if (ev.key === "Enter" && !ev.shiftKey && !(ev.nativeEvent?.isComposing === true)) {
      ev.preventDefault();
      sendQuestion();
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (!(Object.values(ACCEPTED_FILE_TYPES) as string[]).includes(file.type)) {
        setInputError(
          "Only the following file types are supported: .csv, .docx, .pdf, .jpeg, .png, .gif, .bmp, .tiff. Please try a different file."
        );
        setSelectedFile(null);
        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }
        logEvent("submit_prompt_client_error_file_type", { object_type: file.type });
      } else if (file.type.includes("image") && file.size > 10 * 1024 * 1024) {
        // 10MB limit for image files
        setInputError("File size of image attachments cannot exceed 10 MB. Please try a smaller file.");
        setSelectedFile(null);
        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }

        logEvent("submit_prompt_client_error_file_size", {
          object_size: file.size,
          object_type: file.type,
        });
      } else if (file.size > 50 * 1024 * 1024) {
        // 50MB limit for other filetypes
        setInputError("File size of non-image attachments cannot exceed 50 MB. Please try a smaller file.");
        setSelectedFile(null);
        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = "";
        }
        logEvent("submit_prompt_client_error_file_size", {
          object_size: file.size,
          object_type: file.type,
        });
      } else {
        setInputError("");
        setSelectedFile(file);
      }
    }
  };

  const formatFileName = (fileName: string) => {
    if (fileName.length < 20) {
      return fileName;
    }

    return `${fileName.substring(0, 9)}...${fileName.substring(fileName.length - 9)}`;
  };

  return (
    <div className="width-full">
      {inputError && (
        <div
          className={`usa-alert usa-alert--error usa-alert--slim line-height-sans-5 width-full padding-y-0 display-flex flex-justify ${styles.errorAlert}`}
          data-testId="errorAlert"
        >
          <div className="usa-alert__body">
            <p className="usa-alert__text maxw-none">{inputError}</p>
          </div>
          <button
            className={`usa-button usa-button--unstyled margin-right-1 ${styles.closeButton}`}
            aria-label="Close error alert"
            onClick={(_e) => setInputError("")}
          >
            <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
              <use href={`${icons}#close`} />
            </svg>
          </button>
        </div>
      )}
      <div className={styles.questionInput}>
        <textarea
          className={`usa-textarea maxw-none border-0 padding-x-205 height-auto minh-9 ${styles.questionInputTextArea}`}
          placeholder={placeholder}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={onEnterPress}
          aria-label="Type a question"
        ></textarea>

        <div className={`display-flex margin-x-2 margin-bottom-05 ${styles.fileUploadPreviewsContainer}`}>
          {selectedFile && (
            <div
              className={`text-black flex-align-center padding-x-1 ${styles.fileUploadPreview}`}
              data-testid={`filePreview-${selectedFile.name}`}
            >
              <svg className="usa-icon margin-right-05" aria-hidden="true" focusable="false" role="img">
                <use href={`${icons}#image`} />
              </svg>
              <p className={`margin-top-0 font-sans-3xs`}>{formatFileName(selectedFile.name)}</p>
              <button
                className={`usa-button usa-button--unstyled ${styles.closeButton}`}
                aria-label="Remove file upload"
                onClick={(_e) => setSelectedFile(null)}
              >
                <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
                  <use href={`${icons}#close`} />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className={`width-full margin-bottom-3 padding-x-2 ${styles.questionInputChatButtons}`}>
          <div>
            <label
              htmlFor="file-upload"
              className={`usa-button usa-button--unstyled text-no-underline ${styles.fileInputLabel}`}
            >
              <svg className="usa-icon margin-right-05" aria-hidden="true" focusable="false" role="img">
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
        <hr className={`margin-bottom-0 width-full bottom-0 left-0 border-0 ${styles.questionInputBottomBorder}`} />
      </div>
    </div>
  );
};
