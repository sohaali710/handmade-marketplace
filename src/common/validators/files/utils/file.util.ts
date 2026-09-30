import { FileType } from '../types/file.types';
import { lookup } from 'mime-types';

export const createFileTypeRegex = (fileTypes: FileType[]): RegExp => {
  /** ensure that file types are valid and if it sends invalid file type, ignore it
   *  and don't use it in regex*/
  const mediaTypes = fileTypes
    .map((fileType) => lookup(fileType.toLowerCase()))
    .filter((type) => type !== false);

  console.log(mediaTypes);

  return new RegExp(mediaTypes.join('|'));
};
