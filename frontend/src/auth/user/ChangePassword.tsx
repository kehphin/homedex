// @ts-nocheck
import React, { useState } from "react";
import { useUser } from "../../auth";
import { AuthService } from "../AuthService";
import { Navigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const PasswordInput = ({ label, value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="input input-bordered w-full pr-10"
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default function ChangePassword() {
  const hasCurrentPassword = useUser().has_usable_password;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await AuthService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (response.status === 200) {
        setSuccess(true);
      } else {
        setError("Failed to change password. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return <Navigate to="/account/dashboard" />;
  }

  return (
    <div className="p-4 max-w-full mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Change Password</h1>
      <div className="card bg-base-100 max-w-sm mx-auto rounded-box border border-gray-200">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {hasCurrentPassword && (
              <PasswordInput
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            )}
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            {error && (
              <div className="alert alert-error mt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <div className="form-control mt-6">
              <button
                className={`btn btn-primary ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
