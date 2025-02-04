import { useRef, useState } from 'react'
import pdfToText from 'react-pdftotext'
import { extractRawText } from 'mammoth'

import styles from './QuestionInput.module.css'
import { ACCEPTED_FILE_TYPES, UploadedFile, isImageFile } from '../../custom/fileUploadUtils'
import { Alert } from '../../custom/alertUtils'
import { logEvent } from '../../custom/logEvent'
import icons from '@newjersey/njwds/dist/img/sprite.svg'

import { AlertContainer } from './AlertContainer'
import { FileUploadPreviewContainer } from './FileUploadPreviewContainer'

interface Props {
  onSend: (question: string, id?: string, uploadedFiles?: UploadedFile[]) => void
  disabled: boolean
  placeholder?: string
  clearOnSend?: boolean
  conversationId?: string
}

const MAX_INPUT_LENGTH = 1048576
function isValidLength(content: string) {
  return content.length <= MAX_INPUT_LENGTH
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, conversationId }: Props) => {
  const [question, setQuestion] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [inputErrors, setInputErrors] = useState<Alert[]>([])

  const filterUploadedFilesByFiletype = (files: FileList): File[] => {
    const acceptedFileTypesArray = Object.values(ACCEPTED_FILE_TYPES) as string[]

    const validFiles = [...files].filter(file => {
      if (!acceptedFileTypesArray.includes(file.type)) {
        logEvent('submit_prompt_client_error_file_type', { object_type: file.type })
      } else {
        return file
      }
    })

    if (files.length !== validFiles.length) {
      const invalidFiletypeAlert: Alert = {
        message:
          'Only the following file types are supported: .csv, .docx, .pdf, .jpeg, .png, .gif, .bmp, .tiff. Please try a different file.',
        id: `invalidFiletype-${Date.now()}`
      }
      setInputErrors([...inputErrors, invalidFiletypeAlert])
    }

    return validFiles
  }

  const filterUploadedFilesBySize = (files: File[]): File[] => {
    const inputSizeErrors: Alert[] = []
    const validFiles = files.filter(file => {
      if (file.type.includes('image') && file.size > 10 * 1024 * 1024) {
        // 10MB limit for image files
        inputSizeErrors.push({
          message: `${file.name} exceeds 10MB and cannot be uploaded`,
          id: `${file.name}-${Date.now()}`
        })

        console.log(inputErrors)
        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = ''
        }

        logEvent('submit_prompt_client_error_file_size', { object_size: file.size, object_type: file.type })
      } else if (file.size > 50 * 1024 * 1024) {
        // 50MB limit for other filetypes
        inputSizeErrors.push({
          message: `${file.name} exceeds 50MB and cannot be uploaded`,
          id: `${file.name}-${Date.now()}`
        })

        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = ''
        }
        logEvent('submit_prompt_client_error_file_size', { object_size: file.size, object_type: file.type })
      }
    })

    setInputErrors([...inputErrors, ...inputSizeErrors])

    return validFiles
  }

  const sendQuestion = async () => {
    if (disabled || !question.trim()) {
      return
    }

    const send = (uploadedFiles?: UploadedFile[]) => {
      const sendInputErrors: Alert[] = []
      if (uploadedFiles != null && !isImageFile(uploadedFiles) && !isValidLength(uploadedFile.contents)) {
        sendInputErrors.push({
          message: `File contents cannot exceed ${MAX_INPUT_LENGTH} characters. Please try a smaller file.`,
          id: `exceededFileContentCharacterLimitError-${Date.now()}`
        })
        setSelectedFiles([])
        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = ''
        }
        logEvent('submit_prompt_client_error_file_length', {
          object_type: uploadedFile.extension,
          object_length: uploadedFile.contents.length,
          object_size: uploadedFile.size
        })
        return
      }

      if (!isValidLength(question)) {
        sendInputErrors.push({
          message: `Prompt cannot exceed ${MAX_INPUT_LENGTH} characters. Please try a smaller prompt.`,
          id: `exceededPromptCharacterLimitError-${Date.now()}`
        })

        logEvent('submit_prompt_client_error_prompt_length', {
          input_length: question.length
        })
        return
      }

      if (conversationId) {
        onSend(question, conversationId, uploadedFile)
      } else {
        onSend(question, undefined, uploadedFile)
      }

      if (clearOnSend) {
        setQuestion('')
        setSelectedFiles([])
        setInputErrors([])
        if (fileInputRef?.current?.value) {
          fileInputRef.current.value = ''
        }
      }

      setInputErrors([...inputErrors, ...sendInputErrors])
    }

    if (selectedFiles.length > 0) {
      const fileUploadInputErrors: Alert[] = []
      const uploadedFiles: UploadedFile[] = []

      selectedFiles.forEach(async selectedFile => {
        if (selectedFile.type === ACCEPTED_FILE_TYPES.PDF) {
          pdfToText(selectedFile)
            .then(extractedText => {
              if (extractedText.length === 0) {
                fileUploadInputErrors.push({
                  message: `Could not read text from PDF: ${selectedFile.name}. Please try uploading a different file.`,
                  id: `${selectedFile.name}-couldNotReadText-${Date.now()}`
                })
              } else {
                uploadedFiles.push({
                  name: selectedFile.name,
                  contents: extractedText,
                  extension: selectedFile.type,
                  size: selectedFile.size
                })
              }
            })
            .catch(_error => {
              fileUploadInputErrors.push({
                message: `Failed to upload PDF: ${selectedFile.name}. Please try uploading a different file.`,
                id: `${selectedFile.name}-failedToUpload-${Date.now()}`
              })
            })

          return
        }

        if (selectedFile.type === ACCEPTED_FILE_TYPES.CSV) {
          const reader = new FileReader()

          reader.onloadend = () => {
            uploadedFiles.push({
              name: selectedFile.name,
              contents: reader.result as string,
              extension: selectedFile.type,
              size: selectedFile.size
            })
          }

          reader.readAsText(selectedFile)

          return
        }

        if (selectedFile.type === ACCEPTED_FILE_TYPES.DOCX) {
          try {
            const arrayBuffer = await selectedFile.arrayBuffer()
            const extractedText = (await extractRawText({ arrayBuffer })).value

            if (extractedText.length === 0) {
              fileUploadInputErrors.push({
                message: `Could not read text from .docx file: ${selectedFile.name}. Please try uploading a different file.`,
                id: `${selectedFile.name}-couldNotReadText-${Date.now()}`
              })
            } else {
              uploadedFiles.push({
                name: selectedFile.name,
                contents: extractedText,
                extension: selectedFile.type,
                size: selectedFile.size
              })
            }
          } catch (err) {
            fileUploadInputErrors.push({
              message: `Failed to upload .docx file: ${selectedFile.name}. Please try uploading a different file.`,
              id: `${selectedFile.name}-failedToUpload-${Date.now()}`
            })

            return
          }
        } else {
          const reader = new FileReader()
          uploadedFiles.push({
            name: selectedFile.name,
            contents: reader.result as string,
            extension: selectedFile.type,
            size: selectedFile.size
          })
          reader.readAsDataURL(selectedFile)
        }
      })
    }
  }

  const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
    if (ev.key === 'Enter' && !ev.shiftKey && !(ev.nativeEvent?.isComposing === true)) {
      ev.preventDefault()
      sendQuestion()
    }
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files != null) {
      const validFilesByFiletype = filterUploadedFilesByFiletype(files)

      if (validFilesByFiletype.length === 0) {
        return
      }

      const validFilesBySize = filterUploadedFilesBySize(validFilesByFiletype)

      setSelectedFiles([...selectedFiles, ...validFilesBySize])
    }
  }

  const closePreview = (idToClose: string): void => {
    // setSelectedFiles(selectedFiles => selectedFiles.filter(file => file.id !== idToClose))
  }

  const closeError = (idToClose: string): void => {
    setInputErrors(inputErrors => inputErrors.filter(error => error.id !== idToClose))
  }

  return (
    <div className={`flex-wrap flex-column ${styles.questionInputContainer}`}>
      {inputErrors.length > 0 && <AlertContainer onClose={closeError} alerts={inputErrors} />}

      <textarea
        className={`usa-textarea maxw-none border-0 padding-x-205 height-auto minh-9 ${styles.questionInputTextArea}`}
        placeholder={placeholder}
        value={question}
        onChange={e => setQuestion(e.target.value)}
        onKeyDown={onEnterPress}
        aria-label="Type a question"></textarea>

      {selectedFiles.length > 0 && <FileUploadPreviewContainer onClose={closePreview} files={selectedFiles} />}

      <div className={`display-flex margin-bottom-3 width-full padding-x-2 ${styles.questionInputChatButtons}`}>
        <div>
          <label
            htmlFor="file-upload"
            className={`usa-button usa-button--unstyled text-no-underline ${styles.fileInputLabel}`}>
            <svg className="usa-icon margin-right-05" aria-hidden="true" focusable="false" role="img">
              <use href={`${icons}#attach_file`} />
            </svg>
            Upload files
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            accept={(Object.values(ACCEPTED_FILE_TYPES) as string[]).join(',')}
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
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ? sendQuestion() : null)}>
          <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
            <use href={`${icons}#send`} />
          </svg>
        </div>
      </div>
      <hr
        className={`margin-bottom-0 position-absolute width-full bottom-0 left-0 border-0 ${styles.questionInputBottomBorder}`}
      />
    </div>
  )
}
