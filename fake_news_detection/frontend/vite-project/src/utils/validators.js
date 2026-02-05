import { APP_CONFIG } from '../config/constants';

/**
 * Validate file type
 * @param {File} file - File to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateFileType(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!APP_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${APP_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate file size
 * @param {File} file - File to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateFileSize(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate image file (combines type and size validation)
 * @param {File} file - File to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateImageFile(file) {
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) return typeValidation;

  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) return sizeValidation;

  return { valid: true, error: null };
}

/**
 * Validate text input
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateText(text, minLength = 5, maxLength = 500) {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Text is required' };
  }

  if (text.trim().length < minLength) {
    return {
      valid: false,
      error: `Text must be at least ${minLength} characters`,
    };
  }

  if (text.length > maxLength) {
    return {
      valid: false,
      error: `Text must not exceed ${maxLength} characters`,
    };
  }

  return { valid: true, error: null };
}
