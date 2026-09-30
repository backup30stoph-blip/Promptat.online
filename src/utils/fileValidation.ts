/**
 * Client-side file validation utility for media uploads.
 * Ensures uploaded files match allowed MIME types and file size limits.
 */

export interface ValidationOptions {
  maxSizeBytes?: number; // defaults to 10MB
  allowedMimeTypes?: string[]; // e.g. ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'application/pdf', 'application/zip']
  allowedExtensions?: string[]; // e.g. ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf', 'zip']
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  fileDetails?: {
    name: string;
    sizeFormatted: string;
    mimeType: string;
    extension: string;
  };
}

/**
 * Format file sizes to human readable strings
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validates a file against size limits and type specifications
 */
export const validateUploadFile = (
  file: File,
  options: ValidationOptions = {}
): ValidationResult => {
  const {
    maxSizeBytes = 10 * 1024 * 1024, // default 10MB
    allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'image/avif',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed'
    ],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'pdf', 'zip']
  } = options;

  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type || '';

  // 1. Verify File Size
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds the maximum allowed limit of ${formatFileSize(maxSizeBytes)}. Your file is ${formatFileSize(file.size)}.`
    };
  }

  // 2. Verify Extension & MIME Type
  const matchesExtension = allowedExtensions.includes(extension);
  const matchesMimeType = allowedMimeTypes.some(type => {
    // Handle wildcard matching (e.g. 'image/*')
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2);
      return mimeType.startsWith(prefix);
    }
    return type === mimeType;
  });

  if (!matchesExtension && !matchesMimeType) {
    return {
      isValid: false,
      error: `Unsupported file type (${extension || 'unknown'}). Please upload one of the following formats: ${allowedExtensions.join(', ').toUpperCase()}.`
    };
  }

  return {
    isValid: true,
    fileDetails: {
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      mimeType,
      extension
    }
  };
};
