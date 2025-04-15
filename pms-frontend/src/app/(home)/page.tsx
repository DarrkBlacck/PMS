// Login.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Input, Button, Form } from "@heroui/react"; // Grouped third-party UI
import { IoMdEye, IoMdEyeOff } from "react-icons/io"; // Grouped icons

import { useLoginManagement } from "./components/useLoginManagement"; // Local hook

// Constants for strings
const STRINGS = {
  WELCOME_TITLE: "Welcome to PMS",
  LOADING_USERS: "Loading users...",
  EMAIL_PLACEHOLDER: "Email",
  EMAIL_LABEL: "Email Address",
  PASSWORD_PLACEHOLDER: "Password",
  PASSWORD_LABEL: "Password",
  TOGGLE_VISIBILITY_LABEL: "Toggle password visibility",
  SUBMIT_BUTTON_DEFAULT: "Enter PMS",
  SUBMIT_BUTTON_LOADING: "Loading...",
};

/**
 * Renders the login page component.
 * Handles user authentication input, displays loading/error states,
 * and processes toast messages passed via URL parameters.
 */
export default function Login() {
  const searchParams = useSearchParams();
  const toastMessage = searchParams.get('toast');

  // Effect to display toast messages from URL parameters
  useEffect(() => {
    if (toastMessage) {
      // Consider adding different toast types (info, warning) if needed
      toast.error(toastMessage);
    }
  }, [toastMessage]);

  // Manage login state and actions via custom hook
  const {
    email, setEmail,
    password, setPassword,
    error,
    loading,
    visible,
    toggleVisibility,
    handleLogin,
  } = useLoginManagement();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      {/* Login Card */}
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-black">
          {STRINGS.WELCOME_TITLE}
        </h1>

        {/* Status Messages */}
        {loading && <p className="mb-2 text-sm text-blue-500">{STRINGS.LOADING_USERS}</p>}
        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

        {/* Login Form */}
        <Form onSubmit={handleLogin}>
          {/* Email Input */}
          <Input
            type="email"
            aria-label={STRINGS.EMAIL_LABEL} // Accessibility improvement
            isClearable
            placeholder={STRINGS.EMAIL_PLACEHOLDER}
            variant="underlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2 w-full rounded border p-2 text-black" // Combined width/margin classes
            autoComplete="email" // Help password managers
          />

          {/* Password Input */}
          <Input
            type={visible ? "text": "password"}
            aria-label={STRINGS.PASSWORD_LABEL} // Accessibility improvement
            isClearable
            variant="underlined"
            placeholder={STRINGS.PASSWORD_PLACEHOLDER}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded border p-2 text-black" // Combined width/margin classes
            autoComplete="current-password" // Help password managers
            endContent={
              <Button
                isIconOnly
                variant="light"
                onPress={toggleVisibility}
                aria-label={STRINGS.TOGGLE_VISIBILITY_LABEL} // Accessibility improvement
                className="text-gray-500 data-[hover=true]:bg-[initial]" // Ensure this style override is needed
              >
                {visible ? <IoMdEyeOff /> : <IoMdEye />}
              </Button>
            }
          />

          {/* Submit Button */}
          <Button
            type="submit"
            color="secondary"
            className="w-full rounded px-4 py-2 hover:bg-primary disabled:bg-gray-400" // Consistent width class
            disabled={loading}
          >
            {loading ? STRINGS.SUBMIT_BUTTON_LOADING : STRINGS.SUBMIT_BUTTON_DEFAULT}
          </Button>
        </Form>
      </div>
    </div>
  );
}