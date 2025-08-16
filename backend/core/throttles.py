from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginThrottle(AnonRateThrottle):
    scope = 'login'


class ComplaintCreateThrottle(UserRateThrottle):
    scope = 'complaint'
