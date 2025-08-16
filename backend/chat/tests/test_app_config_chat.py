from django.apps import apps


def test_app_config():
    config = apps.get_app_config("chat")
    assert config.name == "chat"
    assert config.default_auto_field == "django.db.models.BigAutoField"
