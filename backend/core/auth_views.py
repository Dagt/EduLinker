from rest_framework_simplejwt.views import TokenObtainPairView

from .throttles import LoginThrottle


class LoginView(TokenObtainPairView):
    throttle_classes = [LoginThrottle]
