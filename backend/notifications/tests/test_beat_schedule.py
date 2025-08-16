from edulinker.celery import app as celery_app


def test_cleanup_task_scheduled():
    schedule = celery_app.conf.beat_schedule
    task = schedule.get("cleanup-invalid-tokens-daily")
    assert task is not None
    assert task["task"] == "notifications.tasks.cleanup_invalid_tokens"
