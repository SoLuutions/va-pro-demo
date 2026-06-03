/**
 * Sanitizes user input to prevent XSS attacks.
 * Works in both Browser (using DOM textContent) and Node.js (using manual replacement).
 */
export function sanitizeInput(input) {
  if (input === null || input === undefined) return '';
  const str = String(input).trim();
  
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
  }
  
  // Safe Node.js fallback HTML escaping
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates whether a string is a valid HTTP/HTTPS URL.
 */
export function isValidUrl(url) {
  if (!url) return true; // Accept empty/null for optional fields
  const trimmed = String(url).trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates a list of newline-separated URLs.
 */
export function validateNewlinedUrls(urlsText) {
  if (!urlsText) return { valid: true, value: '' };
  const lines = String(urlsText).split('\n');
  const sanitizedLines = [];
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (!isValidUrl(line)) {
      return { valid: false, error: `Invalid URL format: "${line}". Must start with http:// or https://` };
    }
    sanitizedLines.push(sanitizeInput(line));
  }
  
  return { valid: true, value: sanitizedLines.join('\n') };
}

/**
 * Sanitizes an object recursively (e.g., user profile, task data)
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validates and sanitizes common form fields
 */
export const FIELD_VALIDATORS = {
  name: (value) => {
    const sanitized = sanitizeInput(value);
    if (sanitized.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
    if (sanitized.length > 100) return { valid: false, error: 'Name must be less than 100 characters' };
    return { valid: true, value: sanitized };
  },
  
  email: (value) => {
    const sanitized = sanitizeInput(value).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) return { valid: false, error: 'Invalid email format' };
    return { valid: true, value: sanitized };
  },
  
  password: (value) => {
    if (!value) return { valid: false, error: 'Password is required' };
    if (value.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
    return { valid: true, value };
  },
  
  description: (value) => {
    const sanitized = sanitizeInput(value);
    if (sanitized.length > 5000) return { valid: false, error: 'Description must be less than 5000 characters' };
    return { valid: true, value: sanitized };
  },
  
  amount: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return { valid: false, error: 'Amount must be a non-negative number' };
    return { valid: true, value: num };
  },
};

/**
 * Validates a field and returns sanitized value or error
 */
export function validateField(fieldName, value) {
  const validator = FIELD_VALIDATORS[fieldName] || ((v) => ({ valid: true, value: sanitizeInput(v) }));
  return validator(value);
}
