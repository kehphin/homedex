from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("_allauth/", include("allauth.headless.urls")),
    path("accounts/", include("allauth.urls")),
    path("stripe/", include("djstripe.urls", namespace="djstripe")),
    path("api/v1/payments/", include("payments.urls")),
    path("api/v1/user_auth/", include("user_auth.urls")),
    path("api/v1/owner/", include("owner.urls")),
]
