from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("_allauth/", include("allauth.headless.urls")),
    path("accounts/", include("allauth.urls")),
    path("stripe/", include("djstripe.urls", namespace="djstripe")),
    path("api/v1/payments/", include("payments.urls")),
    path("api/v1/user_auth/", include("user_auth.urls")),
    path("api/v1/owner/", include("owner.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
