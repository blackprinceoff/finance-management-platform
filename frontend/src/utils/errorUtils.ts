import axios from "axios";

export function extractErrorMessage(e: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(e)) {
    return e.response?.data?.error ?? e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "An unexpected error occurred";
}
