import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as NotificationsService from "./NotificationsService";
import type { NotificationPreference } from "./NotificationsService";

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const data = await NotificationsService.getNotificationPreferences();
      setPreferences(data);
    } catch (error) {
      console.error("Failed to load preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const updated = await NotificationsService.updateNotificationPreferences(
        preferences
      );
      setPreferences(updated);
      toast.success("Notification preferences updated");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save notification preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="alert alert-error">
        <span>Failed to load notification preferences</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Notification Preferences</h2>

          {/* Email Notifications Section */}
          <div className="divider my-2">Email Notifications</div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Overdue Tasks</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={preferences.email_overdue_tasks}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    email_overdue_tasks: e.target.checked,
                  })
                }
              />
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Due Soon Tasks</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={preferences.email_due_soon_tasks}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    email_due_soon_tasks: e.target.checked,
                  })
                }
              />
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email Frequency</span>
            </label>
            <select
              className="select select-bordered"
              value={preferences.email_frequency}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  email_frequency: e.target.value as
                    | "daily"
                    | "weekly"
                    | "never",
                })
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>

          {preferences.last_email_sent && (
            <div className="text-sm text-gray-600 mt-2">
              Last email sent:{" "}
              {new Date(preferences.last_email_sent).toLocaleDateString()}
            </div>
          )}

          {/* In-App Notifications Section */}
          <div className="divider my-2">In-App Notifications</div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Overdue Tasks</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={preferences.inapp_overdue_tasks}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    inapp_overdue_tasks: e.target.checked,
                  })
                }
              />
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Due Soon Tasks</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={preferences.inapp_due_soon_tasks}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    inapp_due_soon_tasks: e.target.checked,
                  })
                }
              />
            </label>
          </div>

          {/* Save Button */}
          <div className="card-actions justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
