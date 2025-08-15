from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/', include('core.urls.py')),
    path('api/v1/', include('surveys.urls.py')),
    path('api/v1/', include('fundraising.urls.py')),
    path('api/v1/', include('analytics.urls.py')),
    path('api/v1/', include('chat.urls.py')),
    path('api/v1/', include('suggestions.urls.py')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    path('api/v1/', include('notifications.urls')),
]
