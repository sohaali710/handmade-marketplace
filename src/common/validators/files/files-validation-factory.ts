import {
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  FileValidator,
} from '@nestjs/common';
import { FileSizeType, FileType } from './types/file.types';
import { createFileTypeRegex } from './utils/file.util';
import { NotEmptyArray } from 'src/common/utils/array.util';
import { parse } from 'bytes';

const createFileValidators = (
  maxSize: FileSizeType,
  fileTypes: FileType[],
): FileValidator[] => {
  const fileTypeRegex = createFileTypeRegex(fileTypes);
  return [
    new MaxFileSizeValidator({
      maxSize: parse(maxSize) as number,
      message: (maxSize) =>
        `File size is too large. Maximum size is ${maxSize / (1024 * 1024)} MB.`,
    }),

    new FileTypeValidator({
      fileType: fileTypeRegex,
    }),
  ];
};

export const createParseFileValidator = (
  maxSize: FileSizeType,
  fileTypes: NotEmptyArray<FileType>,
  errorHttpStatusCode: number,
  fileIsRequired: boolean,
): ParseFilePipe =>
  new ParseFilePipe({
    validators: createFileValidators(maxSize, fileTypes),

    errorHttpStatusCode,
    fileIsRequired,
  });
