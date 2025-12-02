"use client";

import React, { useState } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { showError, showSuccess } from "@/lib/toast";

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakId: number;
  historyId: number;
  streakTitle: string;
  onSubmitSuccess?: () => void;
}

export default function SessionDetailsModal({
  isOpen,
  onClose,
  streakId,
  historyId,
  streakTitle,
  onSubmitSuccess,
}: SessionDetailsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ description?: string; photo?: string }>({});

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Reset form when opening
      setDescription("");
      setPhotoFile(null);
      setPhotoPreview("");
      setErrors({});
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, photo: "Please select a valid image file" }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: "File size must be less than 5MB" }));
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setErrors((prev) => ({ ...prev, photo: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { description?: string; photo?: string } = {};

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!photoFile && !photoPreview) {
      newErrors.photo = "Photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the photo preview as the photoUrl (base64 or URL)
      const photoUrl = photoPreview;

      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        showError("Authentication token not found");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/streaks/${streakId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          historyId,
          description: description.trim(),
          photoUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.message || "Failed to submit session details");
        setIsSubmitting(false);
        return;
      }

      showSuccess("Session details submitted successfully!");
      
      // Reset form and close modal
      setDescription("");
      setPhotoFile(null);
      setPhotoPreview("");
      setErrors({});
      
      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Submit error:", error);
      showError("An error occurred while submitting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 backdrop-blur-sm ${
        isOpen ? "bg-black/20" : "bg-black/0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Session Details
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Please provide details about your streak session for{" "}
                <span className="font-semibold">{streakTitle}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Description Input */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  What did you do? <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: "" }));
                    }
                  }}
                  disabled={isSubmitting}
                  placeholder="Describe your activities during this session (minimum 10 characters)..."
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
                    errors.description
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  rows={4}
                />
                {errors.description && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {errors.description}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {description.length} characters
                </p>
              </div>

              {/* Photo Upload */}
              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photo <span className="text-red-500">*</span>
                </label>

                {/* Photo Preview */}
                {photoPreview ? (
                  <div className="relative mb-3">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview("");
                      }}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded disabled:opacity-50"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
                    <PhotoIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}

                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isSubmitting}
                  className="hidden"
                />

                <label
                  htmlFor="photo"
                  className={`block w-full mt-3 px-4 py-2.5 border rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : photoPreview
                      ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                >
                  {photoPreview ? "✓ Photo selected" : "Choose Photo"}
                </label>

                {errors.photo && (
                  <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {errors.photo}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
