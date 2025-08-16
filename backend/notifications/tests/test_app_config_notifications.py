from django.apps import apps


def test_app_config():
    config = apps.get_app_config("notifications")
    assert config.name == "notifications"
    assert config.default_auto_field == "django.db.models.BigAutoField"
