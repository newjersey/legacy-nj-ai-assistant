import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ACCEPTED_FILE_TYPES } from '../../custom/fileUploadUtils'
import userEvent from '@testing-library/user-event'
import { QuestionInput } from './QuestionInput'

async function uploadFile(file: File) {
  const fileInput = screen.getByLabelText('Upload file')

  await userEvent.upload(fileInput, file)
}

function inputChatMessage(message?: string) {
  const textInputField = screen.getByLabelText('Type a question')

  fireEvent.change(textInputField, {
    target: { value: message ?? 'This is my message' }
  })
}

function submitChatMessage() {
  const submitButton = screen.getByLabelText('Ask question button')

  fireEvent.click(submitButton)
}

describe('Test sending files', () => {
  it('extracts and sends data from PDFs', async () => {
    const file = new File(['hello'], 'default.pdf', { type: ACCEPTED_FILE_TYPES.PDF })

    const { container } = render(
      <QuestionInput
        onSend={() => {}}
        disabled={false}
        placeholder={'placeholder'}
        conversationId={undefined}
        clearOnSend={false}
      />
    )

    await act(async () => {
      // uploadFile(file);
      inputChatMessage()
      submitChatMessage()
    })
  })

  // it('extracts and sends data from CSVs', async () => {})

  // it('extracts and sends data from .doc files', async () => {})

  // it('extracts and sends data from .docx files', async () => {})

  // it('extracts and sends data from image files', async () => {})
})
