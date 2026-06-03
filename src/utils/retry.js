/**
 * Executes a function that returns a promise, retrying it if it fails.
 * Uses exponential backoff.
 * 
 * @param {Function} fn - Async function to execute
 * @param {number} retries - Number of retries (default 3)
 * @param {number} delay - Initial delay in ms (default 1000)
 */
export async function runWithRetry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    console.warn(`Operation failed, retrying in ${delay}ms... (Retries left: ${retries})`, error);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return runWithRetry(fn, retries - 1, delay * 2);
  }
}

/**
 * Standard fetch wrapped with retry logic for network flakiness and 5xx errors.
 */
export async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  return runWithRetry(async () => {
    const response = await fetch(url, options);
    
    // Retry on server errors (5xx)
    if (response.status >= 500) {
      throw new Error(`Server returned status ${response.status}`);
    }
    
    return response;
  }, retries, delay);
}
