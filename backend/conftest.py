import pytest
from django.conf import settings


@pytest.fixture(scope="session", autouse=True)
def disable_migrations():
    settings.MIGRATION_MODULES = {
        "core": None,
        "analytics": None,
        "fundraising": None,
        "chat": None,
        "suggestions": None,
        "notifications": None,
        "audit": None,
        "events": None,
        "surveys": None,
    }
