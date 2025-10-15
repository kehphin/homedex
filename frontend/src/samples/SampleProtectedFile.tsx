// @ts-nocheck
// Ignoring TS as this is mainly for demo purposes
import React, { useState } from "react";
import { useStripeCheckout } from "../payments/hooks";

const SampleProtectedFile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPurchaseOption, setShowPurchaseOption] = useState(false);
  const { handleCheckout, loading: checkoutLoading } = useStripeCheckout();

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);
    setShowPurchaseOption(false);

    try {
      const response = await fetch("/api/v1/owner/download-file", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 403) {
        setShowPurchaseOption(true);
        throw new Error(
          "You need to purchase this product to access the file."
        );
      }

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "protected_file.txt");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(err.message || "An error occurred while downloading the file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = () => {
    // Replace 'your_product_id' with the actual product ID
    const productId = "prod_12345";
    const successUrl = `${window.location.origin}/payment/success`;
    const cancelUrl = `${window.location.origin}/payment/cancel`;

    handleCheckout(productId, successUrl, cancelUrl);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-base-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Download Protected File</h1>
      <p className="mb-4">
        Click the button below to download the protected file. You must have
        purchased the required product to access this file.
      </p>
      <button
        className={`btn btn-primary ${isLoading ? "loading" : ""}`}
        onClick={handleDownload}
        disabled={isLoading}
      >
        {isLoading ? "Downloading..." : "Download File"}
      </button>
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
      {showPurchaseOption && (
        <div className="mt-4">
          <p className="mb-2">
            You need to purchase this product to access the file.
          </p>
          <button
            className={`btn btn-secondary ${checkoutLoading ? "loading" : ""}`}
            onClick={handlePurchase}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? "Processing..." : "Purchase Now"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SampleProtectedFile;
