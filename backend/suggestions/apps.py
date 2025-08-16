from django.apps import AppConfig


class SuggestionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "suggestions"

    def ready(self) -> None:  # pragma: no cover - import signals
        from . import signals  # noqa: F401
