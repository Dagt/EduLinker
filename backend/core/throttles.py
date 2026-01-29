from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginThrottle(AnonRateThrottle):
    scope = 'login'


class PasswordResetRequestThrottle(AnonRateThrottle):
    scope = 'password_reset_request'


class PasswordResetConfirmThrottle(AnonRateThrottle):
    scope = 'password_reset_confirm'


class ComplaintCreateThrottle(UserRateThrottle):
    scope = 'complaint'


class SurveyThrottle(UserRateThrottle):
    scope = 'survey'


class ChatMessageThrottle(UserRateThrottle):
    scope = 'chat'


class EventCreateThrottle(UserRateThrottle):
    scope = 'event_create'
