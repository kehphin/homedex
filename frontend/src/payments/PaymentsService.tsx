import { URLs } from './constants';
import { request } from '../lib/apiUtils';
import { CheckoutSessionResponse, GetCheckoutSessionResponse, PaymentHistoryResponse, ActiveSubscriptionsResponse } from './types';

export default class PaymentsService {
  static async createCheckoutSession(productId: string, successUrl: string, cancelUrl: string): Promise<CheckoutSessionResponse> {
    const response = await request('POST', URLs.CREATE_CHECKOUT_SESSION, {
      product_id: productId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return response.json();
  }

  static async getCheckoutSession(sessionId: string): Promise<GetCheckoutSessionResponse> {
    const response = await fetch(URLs.GET_CHECKOUT_SESSION + sessionId);
    return await response.json();
  }

  static async getPaymentHistory(): Promise<PaymentHistoryResponse> {
    return await request('GET', URLs.PAYMENT_HISTORY);
  }

  static async getActiveSubscriptions(): Promise<ActiveSubscriptionsResponse> {
    return await request('GET', URLs.ACTIVE_SUBSCRIPTIONS);
  }

  static async endSubscription(subscriptionId: string): Promise<{ status: string }> {
    return await request('POST', URLs.END_SUBSCRIPTION, { subscriptionId });
  }

  static async reactivateSubscription(subscriptionId: string): Promise<{ status: string }> {
    return await request('POST', URLs.REACTIVATE_SUBSCRIPTION, { subscriptionId });
  }
}
