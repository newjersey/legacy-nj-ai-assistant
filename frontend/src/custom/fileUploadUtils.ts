// export const ACCEPTED_FILE_TYPES = [
//   'image/jpeg',
//   'image/png',
//   'image/gif',
//   'image/bmp',
//   'image/tiff',
//   'application/pdf',
//   'text/csv',
//   'application/msword',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
// ]

export enum ACCEPTED_FILE_TYPES {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
  BMP = 'image/bmp',
  TIFF = 'image/tiff',
  PDF = 'application/pdf',
  CSV = 'text/csv',
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

export interface UploadedFile {
  name: string
  type: FileType
  contents: string
  size: number
  extension: string
}

export enum FileType {
  Image,
  Pdf,
  Csv,
  Doc
}
