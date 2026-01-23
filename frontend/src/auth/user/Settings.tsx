// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useUser } from "../../auth";
import { AuthService } from "../AuthService";
import { Navigate } from "react-router-dom";
import {
  EyeIcon,
  EyeSlashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import PaymentsService from "../../payments/PaymentsService";
import { Subscription } from "../../payments/types";

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

export default function Settings() {
  const hasCurrentPassword = useUser().has_usable_password;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] =
    useState<boolean>(true);
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"password" | "subscriptions">(
    "subscriptions",
  );

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true);
      const response = await PaymentsService.getActiveSubscriptions();
      setSubscriptions(response.data);
    } catch (err) {
      setSubscriptionsError("Failed to fetch active subscriptions");
      console.error(err);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const endSubscription = async (subscriptionId: string) => {
    if (window.confirm("Are you sure you want to end this subscription?")) {
      try {
        await PaymentsService.endSubscription(subscriptionId);
        fetchSubscriptions();
      } catch (err) {
        setSubscriptionsError("Failed to end subscription");
        console.error(err);
      }
    }
  };

  const reactivateSubscription = async (subscriptionId: string) => {
    try {
      await PaymentsService.reactivateSubscription(subscriptionId);
      fetchSubscriptions();
    } catch (err) {
      setSubscriptionsError("Failed to reactivate subscription");
      console.error(err);
    }
  };

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
    <div className="p-4 max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Tabs */}
      <div className="tabs tabs-bordered mb-6" role="tablist">
        <input
          type="radio"
          name="settings_tabs"
          role="tab"
          className="tab"
          aria-label="Subscription"
          checked={activeTab === "subscriptions"}
          onChange={() => setActiveTab("subscriptions")}
        />
        <div role="tabpanel" className="tab-content p-0">
          {/* Subscriptions Tab Content */}
          <div className="card bg-base-100 rounded-box border border-gray-200 mt-6">
            <div className="card-body">
              <h2 className="card-title">Active Subscriptions</h2>

              {subscriptionsError && (
                <div className="alert alert-error">
                  <span>{subscriptionsError}</span>
                </div>
              )}

              {subscriptionsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : !subscriptions || subscriptions.length === 0 ? (
                <p className="text-center text-base-content opacity-70">
                  You have no active subscriptions.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Plan</th>
                        <th>Price</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((subscription) => (
                        <tr key={subscription.id}>
                          <td>{subscription.plan}</td>
                          <td>
                            ${subscription.price.toFixed(2)}/
                            {subscription.interval}
                          </td>
                          <td>
                            {subscription.status === "canceled" &&
                            subscription.endedAt
                              ? `Canceled on ${new Date(
                                  subscription.endedAt,
                                ).toLocaleDateString()}`
                              : subscription.cancelAtPeriodEnd &&
                                  subscription.status === "active"
                                ? `Ending on ${new Date(
                                    subscription.periodEnd,
                                  ).toLocaleDateString()}`
                                : subscription.status === "active"
                                  ? `Renewing on ${new Date(
                                      subscription.periodEnd,
                                    ).toLocaleDateString()}`
                                  : null}
                          </td>
                          <td>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                subscription.status === "canceled"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {subscription.status}
                            </span>
                          </td>
                          <td>
                            {subscription.cancelAtPeriodEnd ||
                            subscription.status === "canceled" ? (
                              ""
                            ) : (
                              <button
                                className="btn btn-sm btn-error btn-outline"
                                onClick={() => endSubscription(subscription.id)}
                              >
                                <XCircleIcon className="h-4 w-4 mr-2" />
                                End
                              </button>
                            )}
                            {subscription.cancelAtPeriodEnd &&
                            subscription.status === "active" ? (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() =>
                                  reactivateSubscription(subscription.id)
                                }
                              >
                                Reactivate
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <input
          type="radio"
          name="settings_tabs"
          role="tab"
          className="tab"
          aria-label="Password"
          checked={activeTab === "password"}
          onChange={() => setActiveTab("password")}
        />
        <div role="tabpanel" className="tab-content p-0">
          {/* Password Tab Content */}
          <div className="card bg-base-100 max-w-sm mx-auto rounded-box border border-gray-200 mt-6">
            <div className="card-body">
              <h2 className="card-title">Change Password</h2>
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
      </div>
    </div>
  );
}
