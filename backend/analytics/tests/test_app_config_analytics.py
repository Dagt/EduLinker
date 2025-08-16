from django.apps import apps


def test_app_config():
    config = apps.get_app_config("analytics")
    assert config.name == "analytics"
    assert config.default_auto_field == "django.db.models.BigAutoField"
