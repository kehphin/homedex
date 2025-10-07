import React, { Children } from 'react';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { config } from '../config';

const CheckoutButton = ({ stripeProductId, className, disabled, children }) => {
    const { handleCheckout, loading, error } = useStripeCheckout();
    const successUrl = config.appHost + '/payment/success';
    const cancelUrl = config.appHost + '/payment/cancel';

  return (
    <button 
      onClick={() => handleCheckout(stripeProductId, successUrl, cancelUrl)} 
      className={`btn ${className}`} 
      disabled={loading || disabled}
    >
      {loading ? 'Processing...' : children}
    </button>
  );
};

export default CheckoutButton;