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
    if settings.DATABASES["default"]["ENGINE"] == "django.db.backends.sqlite3":
        from django.db.backends.sqlite3.base import DatabaseWrapper as SQLiteDatabaseWrapper

        def set_schema(self, schema_name, tenant_type=None, include_public=False):
            self.schema_name = schema_name
        def set_schema_to_public(self):
            self.schema_name = "public"

        SQLiteDatabaseWrapper.set_schema = set_schema
        SQLiteDatabaseWrapper.set_schema_to_public = set_schema_to_public
