import { getConfigValue } from '../config';

const BASE_URL = '/api/v1/payments';

export const URLs = {
    CREATE_CHECKOUT_SESSION: `${BASE_URL}/create-checkout-session/`,
    GET_CHECKOUT_SESSION: `${BASE_URL}/get-checkout-session/`,
    PAYMENT_HISTORY: `${BASE_URL}/history/`,
    ACTIVE_SUBSCRIPTIONS: `${BASE_URL}/subscriptions/`,
    END_SUBSCRIPTION: `${BASE_URL}/end-subscription/`,
    REACTIVATE_SUBSCRIPTION: `${BASE_URL}/reactivate-subscription/`,
} as const;

export type URLType = typeof URLs[keyof typeof URLs];

export const STRIPE_PUBLIC_KEY = getConfigValue('stripePublicKey');