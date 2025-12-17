import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import * as NotificationsService from "./NotificationsService";
import type { Notification, NotificationSummary } from "./NotificationsService";

interface NotificationCenterProps {
  isEmbedded?: boolean;
}

export default function NotificationCenter({
  isEmbedded = false,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications when component mounts or modal opens
  useEffect(() => {
    if (isOpen || isEmbedded) {
      loadNotifications();
      loadSummary();
    }
  }, [isOpen, isEmbedded]);

  // Load summary on mount for badge count
  useEffect(() => {
    loadSummary();
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOpen || isEmbedded) {
        loadSummary();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen, isEmbedded]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await NotificationsService.getNotifications(20);
      console.log("Notifications API response:", data);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await NotificationsService.getNotificationSummary();
      console.log("Summary API response:", data);
      setSummary(data);
    } catch (error) {
      console.error("Failed to load notification summary:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationsService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      loadSummary();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAsUnread = async (notificationId: string) => {
    try {
      await NotificationsService.markNotificationAsUnread(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: false } : n
        )
      );
      loadSummary();
    } catch (error) {
      console.error("Failed to mark notification as unread:", error);
      toast.error("Failed to mark notification as unread");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationsService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      loadSummary();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return "🔴";
      case "due_today":
        return "🟡";
      case "due_soon":
        return "🟢";
      default:
        return "📌";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "overdue":
        return "border-l-red-500";
      case "due_today":
        return "border-l-yellow-500";
      case "due_soon":
        return "border-l-green-500";
      default:
        return "border-l-blue-500";
    }
  };

  return (
    <>
      {/* Notification Bell Button (only show if not embedded) */}
      {!isEmbedded && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <BellIcon className="h-6 w-6" />
          {summary?.total && summary.total > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {summary.total}
            </span>
          )}
        </button>
      )}

      {/* Embedded View (full page) */}
      {isEmbedded && (
        <div className="card rounded-lg border border-slate-200 shadow-sm bg-base-100">
          <div className="card-body">
            <h2 className="card-title">Recent Notifications</h2>

            {/* Notifications List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 ${getNotificationColor(
                      notification.notification_type
                    )} pl-4 py-3 bg-gray-50 rounded transition-all ${
                      notification.is_read
                        ? "opacity-60"
                        : "opacity-100 border-opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getNotificationIcon(
                              notification.notification_type
                            )}
                          </span>
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Due:{" "}
                          {new Date(
                            notification.task_due_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Mark as read"
                          >
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          </button>
                        )}
                        {notification.is_read && (
                          <button
                            onClick={() => handleMarkAsUnread(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Mark as unread"
                          >
                            <XMarkIcon className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleMarkAllAsRead}
                  className="btn btn-sm btn-ghost"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal View (original) */}
      {!isEmbedded && isOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Notifications
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Summary Stats */}
              {summary && (
                <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {summary.overdue}
                    </div>
                    <div className="text-xs text-gray-600">Overdue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {summary.due_today}
                    </div>
                    <div className="text-xs text-gray-600">Due Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {summary.due_soon}
                    </div>
                    <div className="text-xs text-gray-600">Coming Up</div>
                  </div>
                </div>
              )}

              {/* Notifications List */}
              <div className="px-6 py-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border-l-4 ${getNotificationColor(
                          notification.notification_type
                        )} pl-4 py-3 bg-gray-50 rounded transition-all ${
                          notification.is_read
                            ? "opacity-60"
                            : "opacity-100 border-opacity-100"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {getNotificationIcon(
                                  notification.notification_type
                                )}
                              </span>
                              <h3 className="font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Due:{" "}
                              {new Date(
                                notification.task_due_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.is_read && (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Mark as read"
                              >
                                <CheckIcon className="h-4 w-4 text-green-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-primary hover:text-primary-focus transition-colors"
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
