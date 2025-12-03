import React, { useState, useEffect } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import PaymentsService from "./PaymentsService";
import { Subscription } from "./types";

const ActiveSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await PaymentsService.getActiveSubscriptions();
      setSubscriptions(response.data);
    } catch (err) {
      setError("Failed to fetch active subscriptions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const endSubscription = async (subscriptionId: string) => {
    if (window.confirm("Are you sure you want to end this subscription?")) {
      try {
        await PaymentsService.endSubscription(subscriptionId);
        // Refresh the subscriptions list
        fetchSubscriptions();
      } catch (err) {
        setError("Failed to end subscription");
        console.error(err);
      }
    }
  };

  const reactivateSubscription = async (subscriptionId: string) => {
    try {
      await PaymentsService.reactivateSubscription(subscriptionId);
      // Refresh the subscriptions list
      fetchSubscriptions();
    } catch (err) {
      setError("Failed to reactivate subscription");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error mt-4">{error}</div>;
  }

  return (
    <div className="mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Active Subscriptions</h1>

      <div className="bg-base-100 rounded-box border border-gray-200 overflow-hidden">
        <div className="p-6">
          {!subscriptions || subscriptions.length === 0 ? (
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
                        ${subscription.price.toFixed(2)}/{subscription.interval}
                      </td>
                      <td>
                        {subscription.status === "canceled" &&
                        subscription.endedAt
                          ? `Canceled on ${new Date(
                              subscription.endedAt
                            ).toLocaleDateString()}`
                          : subscription.cancelAtPeriodEnd &&
                            subscription.status === "active"
                          ? `Ending on ${new Date(
                              subscription.periodEnd
                            ).toLocaleDateString()}`
                          : subscription.status === "active"
                          ? `Renewing on ${new Date(
                              subscription.periodEnd
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
  );
};

export default ActiveSubscriptions;
