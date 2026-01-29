from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from core.auth_views import (
    LoginView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)
from core.urls import api_docs_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('api/v1/auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('api/v1/auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('api/v1/', include('core.urls')),
    path('api/v1/', include('surveys.urls')),
    path('api/v1/', include('fundraising.urls')),
    path('api/v1/', include('analytics.urls')),
    path('api/v1/', include('chat.urls')),
    path('api/v1/', include('suggestions.urls')),
    path('api/v1/', include('audit.urls')),
    path('api/v1/', include('notifications.urls')),
    path('api/v1/', include('events.urls')),
]

urlpatterns += api_docs_urlpatterns
