/**
 * Validation utility functions.
 *
 * Common validation helpers for forms and data.
 */

/**
 * Validate email format.
 *
 * @param email - Email to validate
 * @returns True if valid email format
 *
 * @example
 * isValidEmail("admin@example.com") // true
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Validate URL format.
 *
 * @param url - URL to validate
 * @returns True if valid URL format
 *
 * @example
 * isValidUrl("https://example.com") // true
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if string is not empty.
 *
 * @param value - String to check
 * @returns True if not empty
 *
 * @example
 * isNotEmpty("hello") // true
 * isNotEmpty("  ") // false
 */
export function isNotEmpty(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * Validate minimum length.
 *
 * @param value - String to check
 * @param minLength - Minimum length
 * @returns True if meets minimum length
 *
 * @example
 * hasMinLength("password", 6) // true
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength
}

/**
 * Validate maximum length.
 *
 * @param value - String to check
 * @param maxLength - Maximum length
 * @returns True if within maximum length
 *
 * @example
 * hasMaxLength("short", 10) // true
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength
}

/**
 * Validate password strength (basic).
 *
 * @param password - Password to validate
 * @returns Object with validation results
 *
 * @example
 * validatePassword("MyPass123!")
 * // { isValid: true, errors: [] }
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
