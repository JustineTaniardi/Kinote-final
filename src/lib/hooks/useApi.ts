"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Generic API Hook with loading and error states
 * Handles race conditions and cleanup properly
 *
 * @example
 * const { data, loading, error } = useApi<User[]>("/api/users");
 */

export interface UseApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  skip?: boolean; // Skip fetching if true
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export interface UseApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

/**
 * Custom hook for API fetching with proper error handling and race condition prevention
 */
export function useApi<T = unknown>(
  url: string | null,
  options: UseApiOptions = {}
): UseApiResponse<T> {
  const {
    method = "GET",
    headers = {},
    body,
    skip = false,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to track if component is mounted to prevent state updates on unmounted components
  const isMountedRef = useRef(true);

  // Get auth token from localStorage
  const getAuthHeader = useCallback(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }, []);

  // Main fetch function
  const fetchData = useCallback(async () => {
    // Skip if URL is null or skip flag is true
    if (!url || skip) {
      setLoading(false);
      return;
    }

    // Mark component as mounted
    let ignore = false;

    try {
      setLoading(true);
      setError(null);

      const requestHeaders = {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...headers,
      } as Record<string, string>;

      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Add body for non-GET requests
      if (method !== "GET" && body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      // Check if component is still mounted
      if (ignore) return;

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!ignore && isMountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      if (!ignore && isMountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    } finally {
      if (!ignore && isMountedRef.current) {
        setLoading(false);
      }
    }

    return () => {
      ignore = true;
    };
  }, [url, skip, method, body, headers, getAuthHeader, onSuccess, onError]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return { data, loading, error, refetch, mutate };
}
