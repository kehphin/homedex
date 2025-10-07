import React from 'react';
import { useStripeCheckout } from './hooks';
import { config } from '../config'

const CheckoutButton = ({ productId }: { productId: string }) => {
  const { handleCheckout, loading, error } = useStripeCheckout();

  const successUrl = config.appHost + '/account/success';
  const cancelUrl = config.appHost + '/account/cancel';

  return (
    <div>
      <button onClick={() => handleCheckout(productId, successUrl, cancelUrl)} disabled={loading}>
        {loading ? 'Processing...' : 'Checkout'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default CheckoutButton;