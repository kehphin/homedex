import React, { useState } from "react";
import NotificationPreferences from "../notifications/NotificationPreferences";
import NotificationCenter from "../notifications/NotificationCenter";

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<"center" | "preferences">(
    "center"
  );

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-gray-600">
            Manage your notifications and preferences
          </p>
        </div>

        {/* DaisyUI Tabs */}
        <div role="tablist" className="tabs tabs-bordered mb-4">
          <button
            role="tab"
            className={`tab font-semibold ${
              activeTab === "center" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("center")}
          >
            Notification Center
          </button>
          <button
            role="tab"
            className={`tab font-semibold ${
              activeTab === "preferences" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "center" && (
          <div>
            {/* Notifications List */}
            <NotificationCenter isEmbedded={true} />
          </div>
        )}
        {activeTab === "preferences" && (
          <div className="rounded-lg border border-slate-200 shadow-sm bg-base-100">
            <NotificationPreferences />
          </div>
        )}
      </div>
    </div>
  );
}
