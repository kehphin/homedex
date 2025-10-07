import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getCSRFToken } from './csrf';
import { config } from '../config';

// Replace with your Stripe publishable key
const stripePromise = loadStripe(config.stripePublicKey);

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async (productId, successUrl, cancelUrl) => {
    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      
      // Make a request to your server to create a Checkout Session
      const response = await fetch('/api/v1/payments/create-checkout-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken':  getCSRFToken(),
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      });

      const session = await response.json();

      if (session.error) {
        alert('Be sure to configure your stripe public key in your .env file and your product IDs on the checkout pages (or home page).');
        setError(session.error);
        setLoading(false);
        return;
      }

      // Redirect to Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
  
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { handleCheckout, loading, error };
};