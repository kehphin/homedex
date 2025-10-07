// @ts-nocheck
// Ignoring TS as this is mainly for demo purposes
import React, { useEffect, useState } from 'react';
import { useStripeCheckout } from '../payments/hooks';

const SampleProtectedSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPurchaseOption, setShowPurchaseOption] = useState(false);
  const [protectedData, setProtectedData] = useState(null);

  const { handleCheckout, loading: checkoutLoading } = useStripeCheckout();
    useEffect(() => {
        handlePageLoad();
    }, []);

  const handlePageLoad = async () => {
    setIsLoading(true);
    setError(null);
    setShowPurchaseOption(false);

    try {
      const response = await fetch('/api/v1/sample/get-protected-data-subscriptions-any', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403) {
        setShowPurchaseOption(true);
        throw new Error('You need an active subscription to access this page.');
      } else if (response.status === 200) {
        const data = await response.json();
        console.log('Protected data:', data);
        setProtectedData(data);
        setShowPurchaseOption(false);
      } else {
        alert('Failed to get data, are you sure you have your stripe environment setup correctly with product codes in the samples API endpoint.')
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = () => {
    // Replace 'your_product_id' with the actual product ID
    const productId = 'prod_12345';
    const successUrl = `${window.location.origin}/payment/success`;
    const cancelUrl = `${window.location.origin}/payment/cancel`;

    handleCheckout(productId, successUrl, cancelUrl);
  };

  return (
    // If we are still loading, show a spinner
    isLoading ? <div className="flex justify-center items-center h-full"><span className="loading loading-spinner loading-lg"></span></div> :
    // else we should show the protected content
    <div className="max-w-md mx-auto mt-10 p-6 bg-base-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">You need a subscription to access this page</h1>
      <p className="mb-4">If you are not subscribed, you will see a purchase button.</p>
      {error && (
        <div className="alert alert-error mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}
      {showPurchaseOption && (
        <div className="mt-4">
          <p className="mb-2">You need to purchase this subscription to access this page.</p>
          <button 
            className={`btn btn-secondary ${checkoutLoading ? 'loading' : ''}`} 
            onClick={handlePurchase} 
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Processing...' : 'Purchase Now'}
          </button>
        </div>
      )}
      
      {// else we should show the protected content
        protectedData && (
            <div className="mt-4 alert alert-success">
            <h2 className="text-lg font-bold">Congrats!</h2>
            <p>You have a subscription! Here is a message from the server: [{protectedData.message}]</p>
            </div>
        )
      }
    </div>
  );
};

export default SampleProtectedSubscription;