from django.apps import AppConfig


class SurveysConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "surveys"

    def ready(self):
        # Import signal handlers
        try:
            import surveys.signals  # noqa: F401
        except Exception:  # pragma: no cover - avoid failing if missing deps
            pass
