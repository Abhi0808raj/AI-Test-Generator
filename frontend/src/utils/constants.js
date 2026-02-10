export const DEMO_CODE = `/**
 * Validates and formats a user's email address
 * @param {string} email - Email address to validate
 * @returns {string} Formatted email in lowercase
 * @throws {Error} If email is invalid
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Email must be a non-empty string');
  }
  
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  return email.toLowerCase().trim();
}`;
