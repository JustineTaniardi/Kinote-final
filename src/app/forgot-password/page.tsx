"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { usePasswordReset } from "@/lib/hooks/usePasswordReset";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, success } = usePasswordReset();

  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Clear localLoading when error is received
  useEffect(() => {
    if (error) {
      setLocalLoading(false);
    }
  }, [error]);

  // Clear localLoading when success is received
  useEffect(() => {
    if (success) {
      setLocalLoading(false);
    }
  }, [success]);

  // Clear localLoading when isLoading from hook becomes false
  useEffect(() => {
    if (!isLoading && localLoading) {
      setLocalLoading(false);
    }
  }, [isLoading, localLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setValidationError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Invalid email format");
      return;
    }

    // Set local loading state immediately for UI feedback
    setLocalLoading(true);
    await forgotPassword({ email });
    // Don't clear localLoading here - let hook handle clearing when error state updates
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen w-full bg-[#0f1a31] flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-12 flex flex-col items-center">
          <Image
            src="/img/logo/logo.png"
            alt="KINOTE"
            width={120}
            height={36}
            priority
            className="h-auto w-[120px] mb-8"
          />
          <h1 className="text-2xl font-bold text-white text-center">
            Forgot Password?
          </h1>
          <p className="mt-3 text-sm text-white/70 text-center max-w-xs">
            No worries, we&apos;ll help you reset your password.
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-3 focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/30 transition">
                <EnvelopeIcon className="h-5 w-5 text-white/60 shrink-0" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={handleChange}
                  disabled={localLoading || isLoading}
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/50 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error Message */}
            {(validationError || error) && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 text-sm text-red-100">
                {validationError || error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-lg bg-green-500/20 border border-green-500/50 p-4 text-sm text-green-100">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={localLoading || isLoading}
              className="w-full py-3 bg-white text-[#0f1a31] font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {localLoading || isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>Sending...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            {/* Back to Login Link */}
            <p className="text-center text-sm text-white/70">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-white hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </form>
        </div>

        {/* Back Button - Top Left */}
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <span className="text-sm font-medium">Home</span>
          </Link>
        </div>
      </div>

      {/* Desktop View */}
      <section className="hidden md:block relative h-screen overflow-hidden">
        {/* Bg */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/img/auth-page/background.png')" }}
        />

        {/* Wrap */}
        <div className="relative z-10 flex h-full w-full items-center justify-center px-4 md:px-6">
          {/* Board */}
          <div className="relative grid w-full max-w-[1150px] h-[640px] grid-cols-1 overflow-hidden rounded-2xl bg-white/90 shadow-[0_24px_100px_rgba(2,6,23,0.15)] backdrop-blur md:grid-cols-2">
            {/* Left */}
            <div className="relative flex flex-col items-start justify-center bg-[#0f1a31] px-8 py-10 md:px-10 md:py-12 text-white">
              {/* Logo */}
              <Image
                src="/img/logo/logo.png"
                alt="KINOTE"
                width={150}
                height={45}
                priority
                className="absolute top-8 left-8 h-auto w-[140px] md:w-[150px]"
              />

              {/* Text */}
              <div className="max-w-[300px]">
                <h2 className="text-[24px] font-semibold leading-snug">
                  Forgot Password?
                </h2>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  No worries, we&apos;ll help you reset your password by sending a reset link to your email.
                </p>
              </div>

              {/* Home */}
              <div className="absolute bottom-8 left-8">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-[#0f1a31] hover:bg-transparent hover:border-white hover:text-white transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </Link>
              </div>
            </div>

            {/* Right */}
            <div className="relative bg-white overflow-hidden">
              {/* BgLogo */}
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src="/img/auth-page/logo_back.png"
                  alt="Kinote back"
                  width={700}
                  height={700}
                  className="absolute -bottom-2.5 -right-2.5 object-contain scale-105 select-none"
                  priority
                />
              </div>

              {/* Sosmed */}
              <div className="absolute right-6 top-6 z-10 flex items-center gap-3">
                <a
                  href="https://www.instagram.com/justinetaniardi/"
                  target="_blank"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#0f1a31] text-white hover:opacity-90 transition"
                >
                  <Image
                    src="/icons/instagram.png"
                    alt="Instagram"
                    width={20}
                    height={20}
                  />
                </a>
                <a
                  href="https://www.linkedin.com/in/justine-taniardi/"
                  target="_blank"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#0f1a31] text-white hover:opacity-90 transition"
                >
                  <Image
                    src="/icons/linkedin.png"
                    alt="LinkedIn"
                    width={20}
                    height={20}
                  />
                </a>
                <a
                  href="https://wa.me/6281258126007"
                  target="_blank"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#0f1a31] text-white hover:opacity-90 transition"
                >
                  <Image
                    src="/icons/whatsapp.png"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                  />
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <form
                onSubmit={handleSubmit}
                className="pointer-events-auto w-[88%] md:w-[460px] rounded-xl bg-white p-6 md:p-7 shadow-[0_20px_80px_rgba(2,6,23,0.12)] space-y-4"
              >
                <h1 className="text-center text-[24px] font-extrabold text-[#0f1a31]">
                  Forgot Password
                </h1>

                {/* Email */}
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200 transition">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Insert your Email"
                    value={email}
                    onChange={handleChange}
                    disabled={localLoading || isLoading}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>

                {/* Error Message */}
                {(validationError || error) && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {validationError || error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                    {success}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={localLoading || isLoading}
                  className="mt-6 w-full rounded-md bg-[#0f1a31] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#101c36] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {localLoading || isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span>Sending...</span>
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                {/* Back to Login Link */}
                <p className="text-center text-sm text-slate-600">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#0f1a31] hover:underline"
                  >
                    Back to Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
