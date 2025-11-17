import { useCallback, useState } from "react";

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordResponse {
  message: string;
  id: number;
  email: string;
}

export function usePasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const forgotPassword = useCallback(
    async (
      payload: ForgotPasswordPayload
    ): Promise<ForgotPasswordResponse | null> => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to send reset email");
          return null;
        }

        setSuccess(data.message || "Reset email sent successfully");
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (
      payload: ResetPasswordPayload
    ): Promise<ResetPasswordResponse | null> => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to reset password");
          return null;
        }

        setSuccess(data.message || "Password reset successfully");
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyEmail = useCallback(
    async (
      token: string
    ): Promise<{ message: string; id: number; email: string } | null> => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`, {
          method: "GET",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to verify email");
          return null;
        }

        setSuccess(data.message || "Email verified successfully");
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    forgotPassword,
    resetPassword,
    verifyEmail,
    isLoading,
    error,
    success,
  };
}
