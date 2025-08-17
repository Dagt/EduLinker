from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginThrottle(AnonRateThrottle):
    scope = 'login'


class ComplaintCreateThrottle(UserRateThrottle):
    scope = 'complaint'


class SurveyThrottle(UserRateThrottle):
    scope = 'survey'


class ChatMessageThrottle(UserRateThrottle):
    scope = 'chat'


class EventCreateThrottle(UserRateThrottle):
    scope = 'event_create'
