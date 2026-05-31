import { formatAuthError } from "../src/utils/authErrors.js";

export function mapServerRegisterError(raw) {
  return formatAuthError(raw);
}
