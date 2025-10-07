# urls.py
from django.urls import path
from payments import views

urlpatterns = [
    path('create-checkout-session/', views.CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('cancel-subscription/', views.CancelSubscriptionView.as_view(), name='cancel-subscription'),
    path('get-checkout-session/<str:session_id>/', views.GetCheckoutSessionView.as_view(), name='get-checkout-session'),
    path('history/', views.PaymentHistoryView.as_view(), name='payment-history'),
    path('subscriptions/', views.ActiveSubscriptionsView.as_view(), name='active-subscriptions'),
    path('end-subscription/', views.CancelSubscriptionView.as_view(), name='end-subscription'),
    path('reactivate-subscription/', views.ReactivateSubscriptionView.as_view(), name='reactivate-subscription'),
]