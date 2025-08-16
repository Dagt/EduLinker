import logging
import threading
import uuid


_state = threading.local()


def set_context(request):
    _state.request_id = str(uuid.uuid4())
    _state.school_id = getattr(request, "school_id", None)
    user = getattr(request, "user", None)
    _state.user_id = user.id if getattr(user, "is_authenticated", False) else None


def clear_context():
    for attr in ["request_id", "school_id", "user_id"]:
        if hasattr(_state, attr):
            delattr(_state, attr)


class ContextFilter(logging.Filter):
    def filter(self, record):
        record.request_id = getattr(_state, "request_id", None)
        record.school_id = getattr(_state, "school_id", None)
        record.user_id = getattr(_state, "user_id", None)
        return True

