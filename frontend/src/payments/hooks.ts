import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import PaymentsService from './PaymentsService';
import { STRIPE_PUBLIC_KEY } from './constants';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const useStripeCheckout = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (productId: string, successUrl: string, cancelUrl: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await PaymentsService.createCheckoutSession(productId, successUrl, cancelUrl);
      const session = await response;

      if (session.error) {
        setError(session.error);
        setLoading(false);
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        setError('Stripe.js has not loaded yet.');
        setLoading(false);
        return;
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (stripeError) {
        setError(stripeError.message || 'An unknown error occurred');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { handleCheckout, loading, error };
};

export { useStripeCheckout };
