import { useCallback, useRef, useState } from 'react';

import { MAX_UPLOAD_SIZE_MB, SUPPORTED_VIDEO_EXTENSIONS, SUPPORTED_VIDEO_FORMATS } from '../model/constants';

const INVALID_TYPE_MESSAGE = `Unsupported file type. Please upload a ${SUPPORTED_VIDEO_FORMATS.join(', ')} video.`;
const TOO_LARGE_MESSAGE = `File is too large. The maximum size is ${MAX_UPLOAD_SIZE_MB} MB.`;

const EXTENSION_PATTERN = new RegExp(`\\.(${SUPPORTED_VIDEO_EXTENSIONS.join('|')})$`, 'i');

const isSupportedVideo = (file: File): boolean => {
  // Prefer the extension: browsers report inconsistent MIME types for AVI/MKV/WMV.
  if (EXTENSION_PATTERN.test(file.name)) return true;
  return file.type.startsWith('video/');
};

interface UseVideoUploadOptions {
  onFileAccepted: (file: File) => void;
}

/**
 * Drag-and-drop + file-picker logic for the landing upload zone.
 * Owns the three visual states the spec calls for: default, drag-over, invalid.
 */
export const useVideoUpload = ({ onFileAccepted }: UseVideoUploadOptions) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndAccept = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!isSupportedVideo(file)) {
        setError(INVALID_TYPE_MESSAGE);
        return;
      }
      if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
        setError(TOO_LARGE_MESSAGE);
        return;
      }
      setError(null);
      onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const openFilePicker = useCallback(() => inputRef.current?.click(), []);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      validateAndAccept(event.target.files?.[0]);
      // Reset so selecting the same file again still fires change.
      event.target.value = '';
    },
    [validateAndAccept]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);
      validateAndAccept(event.dataTransfer.files?.[0]);
    },
    [validateAndAccept]
  );

  return {
    inputRef,
    isDragOver,
    error,
    openFilePicker,
    onInputChange,
    dropzoneHandlers: { onDragOver, onDragLeave, onDrop }
  };
};
