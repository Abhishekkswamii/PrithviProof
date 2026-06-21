/** Maps Firebase Auth error codes to safe user-facing messages */
export function mapAuthError(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: string }).code === "string"
      ? (error as { code: string }).code
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support if you need help.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Password does not meet security requirements.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled before completion.";
    case "auth/popup-blocked":
      return "Pop-up was blocked. Allow pop-ups for this site and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled. Contact support.";
    case "auth/missing-password":
      return "Password is required.";
    default:
      // Do not expose internal auth/ codes to the user interface.
      if (error instanceof Error && error.message && !error.message.includes("auth/")) {
        return error.message;
      }
      return "Something went wrong. Please try again.";
  }
}
