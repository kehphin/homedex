
export interface CheckoutSessionResponse {
    sessionId: string;
    error?: string;
}

export interface PaymentHistoryItem {
    id: string;
    amount: number;
    status: string;
    created: string;
    refunded: boolean;
    description: string;
}

export interface PaymentHistoryResponse {
    data: PaymentHistoryItem[];
}
  
export interface Subscription {
    id: string;
    plan: string;
    price: number;
    interval: string;
    periodEnd: string; 
    canceledAt: string | null;
    cancelAt: string | null;
    endedAt: string | null;
    cancelAtPeriodEnd: boolean;
    status: string;
}
  
export interface ActiveSubscriptionsResponse {
    data: Subscription[];
}
  
export interface GetCheckoutSessionResponse {
    session: any; 
    customer_email: string | null;
}